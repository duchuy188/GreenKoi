package com.koipond.backend.service;

import com.koipond.backend.dto.MaintenanceRequestDTO;
import com.koipond.backend.model.MaintenanceRequest;
import com.koipond.backend.model.User;
import com.koipond.backend.model.Project;
import com.koipond.backend.repository.MaintenanceRequestRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.function.Consumer;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.core.JsonProcessingException;

@Service
public class MaintenanceRequestService {
    private static final Logger logger = LoggerFactory.getLogger(MaintenanceRequestService.class);

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public MaintenanceRequestService(MaintenanceRequestRepository maintenanceRequestRepository, 
                                     UserRepository userRepository,
                                     ProjectService projectService) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    public MaintenanceRequestDTO createMaintenanceRequest(MaintenanceRequestDTO dto, String customerId) {
        logger.debug("Attempting to create maintenance request. DTO: {}, CustomerId: {}", dto, customerId);
        
        Project project = projectService.getProjectById(dto.getProjectId());
        logger.debug("Project found: {}", project);
        
        User customer = userRepository.findById(customerId)
            .orElseThrow(() -> {
                logger.error("Customer not found with id: {}", customerId);
                return new ResourceNotFoundException("Customer not found");
            });
        
        // Kiểm tra quyền sở hữu dự án
        if (!project.getCustomer().getId().equals(customerId)) {
            logger.warn("Attempt to create maintenance request for unowned project. Project owner: {}, Requester: {}", project.getCustomer().getId(), customerId);
            throw new IllegalArgumentException("Cannot create maintenance request for unowned project");
        }

        if (!"COMPLETED".equals(project.getStatus().getName())) {
            logger.warn("Attempt to create maintenance request for incomplete project. Project status: {}", project.getStatus().getName());
            throw new IllegalArgumentException("Cannot create maintenance request for incomplete project");
        }

        MaintenanceRequest request = convertToEntity(dto);
        request.setCustomer(customer);
        request.setProject(project);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        request.setRequestStatus(MaintenanceRequest.RequestStatus.PENDING);
        // Không set consultant ở đây

        request = maintenanceRequestRepository.save(request);
        logger.info("Maintenance request created successfully. Request ID: {}", request.getId());
        return convertToDTO(request);
    }

    public List<MaintenanceRequestDTO> getMaintenanceRequestsByCustomer(String customerId) {
        return maintenanceRequestRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MaintenanceRequestDTO startReviewingRequest(String id, String consultantId) {
        return updateMaintenanceRequest(id, request -> {
            User consultant = userRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant not found with id: " + consultantId));
            request.setConsultant(consultant);
            request.setRequestStatus(MaintenanceRequest.RequestStatus.REVIEWING);
        });
    }

    public MaintenanceRequestDTO confirmMaintenanceRequest(String id, BigDecimal agreedPrice) {
        return updateMaintenanceRequest(id, request -> {
            request.setAgreedPrice(agreedPrice);
            request.setRequestStatus(MaintenanceRequest.RequestStatus.CONFIRMED);
        });
    }

    public MaintenanceRequestDTO assignMaintenanceStaff(String id, String staffId) {
        return updateMaintenanceRequest(id, request -> {
            User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Construction staff not found with id: " + staffId));
            if (!staff.getRoleId().equals("4")) {
                throw new IllegalArgumentException("The assigned user must be a Construction Staff");
            }
            if (staff.isHasActiveMaintenance()) {
                throw new IllegalStateException("The construction staff already has an active maintenance task");
            }
            request.setAssignedTo(staff);
            request.setMaintenanceStatus(MaintenanceRequest.MaintenanceStatus.ASSIGNED);
            staff.setHasActiveMaintenance(true);
            userRepository.save(staff);
        });
    }

    public MaintenanceRequestDTO scheduleMaintenance(String id, String scheduledDate) {
        return updateMaintenanceRequest(id, request -> {
            request.setScheduledDate(LocalDate.parse(scheduledDate));
            request.setMaintenanceStatus(MaintenanceRequest.MaintenanceStatus.SCHEDULED);
        });
    }

    public MaintenanceRequestDTO startMaintenance(String id) {
        return updateMaintenanceStatus(id, MaintenanceRequest.MaintenanceStatus.IN_PROGRESS);
    }

    public MaintenanceRequestDTO completeMaintenance(String id, String maintenanceNotes, List<String> maintenanceImages) {
        return updateMaintenanceRequest(id, request -> {
            request.setMaintenanceStatus(MaintenanceRequest.MaintenanceStatus.COMPLETED);
            request.setCompletionDate(LocalDate.now());
            request.setMaintenanceNotes(maintenanceNotes);
            try {
                request.setMaintenanceImages(objectMapper.writeValueAsString(maintenanceImages));
            } catch (JsonProcessingException e) {
                logger.error("Error converting maintenance images to JSON", e);
            }
            User staff = request.getAssignedTo();
            if (staff != null) {
                staff.setHasActiveMaintenance(false);
                userRepository.save(staff);
            }
        });
    }

    public List<MaintenanceRequestDTO> getPendingMaintenanceRequests() {
        return maintenanceRequestRepository.findByRequestStatus(MaintenanceRequest.RequestStatus.PENDING)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<MaintenanceRequestDTO> getConfirmedMaintenanceRequests() {
        return maintenanceRequestRepository.findByRequestStatusAndMaintenanceStatusIsNull(MaintenanceRequest.RequestStatus.CONFIRMED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<MaintenanceRequestDTO> getAssignedMaintenanceRequests(String staffId) {
        return maintenanceRequestRepository.findByAssignedToIdAndMaintenanceStatus(
            staffId, MaintenanceRequest.MaintenanceStatus.ASSIGNED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public MaintenanceRequestDTO cancelMaintenanceRequest(String id, String userId, String userRole, String cancellationReason) {
        return updateMaintenanceRequest(id, request -> {
            switch (userRole) {
                case "ROLE_5": // Customer
                    if (request.getRequestStatus() == MaintenanceRequest.RequestStatus.CONFIRMED) {
                        throw new IllegalStateException("Customers cannot cancel a confirmed maintenance request");
                    }
                    if (!request.getCustomer().getId().equals(userId)) {
                        throw new IllegalArgumentException("Customers can only cancel their own maintenance requests");
                    }
                    break;
                case "ROLE_2": // Consultant
                    if (request.getMaintenanceStatus() != null) {
                        throw new IllegalStateException("Cannot cancel a maintenance request that has already been assigned");
                    }
                    break;
                case "ROLE_1": // Manager
                    if (request.getRequestStatus() != MaintenanceRequest.RequestStatus.CONFIRMED || request.getMaintenanceStatus() != null) {
                        throw new IllegalStateException("Managers can only cancel confirmed requests before assignment");
                    }
                    break;
                default:
                    throw new IllegalArgumentException("User does not have permission to cancel maintenance requests");
            }
            
            request.setRequestStatus(MaintenanceRequest.RequestStatus.CANCELLED);
            request.setCancellationReason(cancellationReason);
            
            // Notify customer if cancelled by staff
            if (!userRole.equals("ROLE_5")) {
                notifyCustomerAboutCancellation(request);
            }
        });
    }

    private void notifyCustomerAboutCancellation(MaintenanceRequest request) {
        // Implement notification logic here
        // This could involve sending an email, push notification, etc.
        logger.info("Notifying customer about cancellation of maintenance request: {}", request.getId());
    }

    private MaintenanceRequest convertToEntity(MaintenanceRequestDTO dto) {
        MaintenanceRequest entity = new MaintenanceRequest();
        copyCommonFields(dto, entity);
        
        if (dto.getCustomerId() != null) {
            entity.setCustomer(userRepository.findById(dto.getCustomerId()).orElse(null));
        }
        // Bỏ phần set consultant
        if (dto.getAssignedTo() != null) {
            entity.setAssignedTo(userRepository.findById(dto.getAssignedTo()).orElse(null));
        }
        if (dto.getProjectId() != null) {
            Project project = projectService.getProjectById(dto.getProjectId());
            entity.setProject(project);
        }
        
        if (entity.getRequestStatus() == null) {
            entity.setRequestStatus(MaintenanceRequest.RequestStatus.PENDING);
        }
        
        return entity;
    }

    private MaintenanceRequestDTO convertToDTO(MaintenanceRequest entity) {
        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        copyCommonFields(entity, dto);
        
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
        }
        if (entity.getConsultant() != null) {
            dto.setConsultantId(entity.getConsultant().getId());
        }
        if (entity.getAssignedTo() != null) {
            dto.setAssignedTo(entity.getAssignedTo().getId());
        }
        if (entity.getProject() != null) {
            dto.setProjectId(entity.getProject().getId());
        }
        
        return dto;
    }

    private void copyCommonFields(Object source, Object target) {
        if (source instanceof MaintenanceRequestDTO && target instanceof MaintenanceRequest) {
            copyFields((MaintenanceRequestDTO) source, (MaintenanceRequest) target);
        } else if (source instanceof MaintenanceRequest && target instanceof MaintenanceRequestDTO) {
            copyFields((MaintenanceRequest) source, (MaintenanceRequestDTO) target);
        }
    }

    private void copyFields(MaintenanceRequestDTO source, MaintenanceRequest target) {
        target.setDescription(source.getDescription());
        target.setAttachments(source.getAttachments());
        target.setRequestStatus(source.getRequestStatus());
        target.setMaintenanceStatus(source.getMaintenanceStatus());
        target.setAgreedPrice(source.getAgreedPrice());
        target.setScheduledDate(source.getScheduledDate());
        target.setStartDate(source.getStartDate());
        target.setCompletionDate(source.getCompletionDate());
        target.setCancellationReason(source.getCancellationReason());
        target.setMaintenanceNotes(source.getMaintenanceNotes());
        try {
            target.setMaintenanceImages(objectMapper.writeValueAsString(source.getMaintenanceImages()));
        } catch (JsonProcessingException e) {
            logger.error("Error converting maintenance images to JSON", e);
        }
    }

    private void copyFields(MaintenanceRequest source, MaintenanceRequestDTO target) {
        target.setId(source.getId());
        target.setDescription(source.getDescription());
        target.setAttachments(source.getAttachments());
        target.setRequestStatus(source.getRequestStatus());
        target.setMaintenanceStatus(source.getMaintenanceStatus());
        target.setAgreedPrice(source.getAgreedPrice());
        target.setScheduledDate(source.getScheduledDate());
        target.setStartDate(source.getStartDate());
        target.setCompletionDate(source.getCompletionDate());
        target.setCancellationReason(source.getCancellationReason());
        target.setCreatedAt(source.getCreatedAt());
        target.setUpdatedAt(source.getUpdatedAt());
        target.setMaintenanceNotes(source.getMaintenanceNotes());
        try {
            target.setMaintenanceImages(objectMapper.readValue(source.getMaintenanceImages(), new TypeReference<List<String>>() {}));
        } catch (JsonProcessingException e) {
            logger.error("Error parsing maintenance images JSON", e);
        }
    }

    private MaintenanceRequest findMaintenanceRequestById(String id) {
        return maintenanceRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    private MaintenanceRequestDTO updateMaintenanceRequest(String id, Consumer<MaintenanceRequest> updateFunction) {
        MaintenanceRequest request = findMaintenanceRequestById(id);
        updateFunction.accept(request);
        request.setUpdatedAt(LocalDateTime.now());
        request = maintenanceRequestRepository.save(request);
        return convertToDTO(request);
    }

    private MaintenanceRequestDTO updateMaintenanceStatus(String id, MaintenanceRequest.MaintenanceStatus status) {
        return updateMaintenanceRequest(id, request -> {
            request.setMaintenanceStatus(status);
            if (status == MaintenanceRequest.MaintenanceStatus.IN_PROGRESS) {
                request.setStartDate(LocalDate.now());
            } else if (status == MaintenanceRequest.MaintenanceStatus.COMPLETED) {
                request.setCompletionDate(LocalDate.now());
            }
        });
    }

    public List<MaintenanceRequestDTO> getCancelledMaintenanceRequests() {
        return maintenanceRequestRepository.findByRequestStatus(MaintenanceRequest.RequestStatus.CANCELLED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}
