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
import com.koipond.backend.dto.ReviewDTO;
import com.koipond.backend.model.Review;
import com.koipond.backend.repository.ReviewRepository;
import java.util.Optional;
import static com.koipond.backend.model.MaintenanceRequest.RequestStatus;
import static com.koipond.backend.model.MaintenanceRequest.MaintenanceStatus;
import static com.koipond.backend.model.MaintenanceRequest.PaymentStatus;
import static com.koipond.backend.model.MaintenanceRequest.PaymentMethod;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class MaintenanceRequestService {
    private static final Logger logger = LoggerFactory.getLogger(MaintenanceRequestService.class);

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private VNPayService vnPayService;

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

        // Kiá»ƒm tra quyá»n sá»Ÿ há»¯u dá»± Ã¡n
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
        request.setRequestStatus(RequestStatus.PENDING);
        request.setPaymentStatus(PaymentStatus.UNPAID);


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
        return maintenanceRequestRepository.findByAssignedToIdAndMaintenanceStatusIn(
            staffId, List.of(MaintenanceRequest.MaintenanceStatus.ASSIGNED,
                             MaintenanceRequest.MaintenanceStatus.IN_PROGRESS,
                             MaintenanceRequest.MaintenanceStatus.SCHEDULED))
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
        // Bá» pháº§n set consultant
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

    private MaintenanceRequestDTO convertToDTO(MaintenanceRequest request) {
        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        
        // Copy ID vÃ  cÃ¡c trÆ°á»ng cÆ¡ báº£n
        dto.setId(request.getId());
        
        // Copy thÃ´ng tin khÃ¡ch hÃ ng
        if (request.getCustomer() != null) {
            User customer = request.getCustomer();
            dto.setCustomerId(customer.getId());
            dto.setCustomerName(customer.getFullName());
            dto.setCustomerPhone(customer.getPhone());
            dto.setCustomerEmail(customer.getEmail());
            dto.setCustomerAddress(customer.getAddress());
        }
        
        // Copy thÃ´ng tin dá»± Ã¡n
        if (request.getProject() != null) {
            Project project = request.getProject();
            dto.setProjectId(project.getId());
            dto.setProjectName(project.getName());
        }
        
        // Copy thÃ´ng tin consultant vÃ  staff
        if (request.getConsultant() != null) {
            dto.setConsultantId(request.getConsultant().getId());
            dto.setConsultantName(request.getConsultant().getFullName());
        }
        
        if (request.getAssignedTo() != null) {
            dto.setAssignedTo(request.getAssignedTo().getId());
            dto.setAssignedToName(request.getAssignedTo().getFullName());
        }
        
        // Copy cÃ¡c trÆ°á»ng cÃ²n láº¡i
        dto.setDescription(request.getDescription());
        dto.setAttachments(request.getAttachments());
        dto.setRequestStatus(request.getRequestStatus());
        dto.setMaintenanceStatus(request.getMaintenanceStatus());
        dto.setAgreedPrice(request.getAgreedPrice());
        
        // Copy cÃ¡c trÆ°á»ng ngÃ y thÃ¡ng
        dto.setScheduledDate(request.getScheduledDate());
        dto.setStartDate(request.getStartDate());
        dto.setCompletionDate(request.getCompletionDate());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        
        // Copy cÃ¡c trÆ°á»ng khÃ¡c
        dto.setCancellationReason(request.getCancellationReason());
        dto.setMaintenanceNotes(request.getMaintenanceNotes());
        
        // Copy thÃ´ng tin thanh toÃ¡n
        dto.setPaymentStatus(request.getPaymentStatus());
        dto.setPaymentMethod(request.getPaymentMethod());
        dto.setDepositAmount(request.getDepositAmount());
        dto.setRemainingAmount(request.getRemainingAmount());
        
        // Copy maintenance images
        try {
            if (request.getMaintenanceImages() != null) {
                dto.setMaintenanceImages(objectMapper.readValue(request.getMaintenanceImages(), 
                    new TypeReference<List<String>>() {}));
            }
        } catch (JsonProcessingException e) {
            logger.error("Error parsing maintenance images JSON", e);
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
        
        // ThÃªm cÃ¡c trÆ°á»ng payment má»›i
        target.setPaymentStatus(source.getPaymentStatus());
        target.setPaymentMethod(source.getPaymentMethod());
        target.setDepositAmount(source.getDepositAmount());
        target.setRemainingAmount(source.getRemainingAmount());
        
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
        
        // ThÃªm cÃ¡c trÆ°á»ng payment má»›i
        target.setPaymentStatus(source.getPaymentStatus());
        target.setPaymentMethod(source.getPaymentMethod());
        target.setDepositAmount(source.getDepositAmount());
        target.setRemainingAmount(source.getRemainingAmount());
        
        try {
            target.setMaintenanceImages(objectMapper.readValue(source.getMaintenanceImages(), 
                new TypeReference<List<String>>() {}));
        } catch (JsonProcessingException e) {
            logger.error("Error parsing maintenance images JSON", e);
        }
    }

    private MaintenanceRequest findMaintenanceRequestById(String id) {
        return maintenanceRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    private MaintenanceRequestDTO updateMaintenanceRequest(String id, Consumer<MaintenanceRequest> updateFunction) {
        synchronized (id.intern()) {
            MaintenanceRequest request = findMaintenanceRequestById(id);
            
            // LÆ°u tráº¡ng thÃ¡i hiá»‡n táº¡i Ä‘á»ƒ kiá»ƒm tra
            RequestStatus currentRequestStatus = request.getRequestStatus();
            MaintenanceStatus currentMaintenanceStatus = request.getMaintenanceStatus();
            
            // Thá»±c hiá»‡n cáº­p nháº­t
            updateFunction.accept(request);
            
            // Kiá»ƒm tra tÃ­nh há»£p lá»‡ cá»§a viá»‡c chuyá»ƒn tráº¡ng thÃ¡i
            validateStateTransition(currentRequestStatus, currentMaintenanceStatus, request);
            
            // Cáº­p nháº­t thá»i gian
            request.setUpdatedAt(LocalDateTime.now());
            
            // LÆ°u vÃ  chuyá»ƒn Ä‘á»•i káº¿t quáº£
            request = maintenanceRequestRepository.save(request);
            return convertToDTO(request);
        }
    }

    private void validateStateTransition(RequestStatus oldRequestStatus, 
                                       MaintenanceStatus oldMaintenanceStatus,
                                       MaintenanceRequest request) {
        RequestStatus newRequestStatus = request.getRequestStatus();
        MaintenanceStatus newMaintenanceStatus = request.getMaintenanceStatus();

        // Kiá»ƒm tra cÃ¡c tráº¡ng thÃ¡i khÃ´ng Ä‘Æ°á»£c phÃ©p thay Ä‘á»•i
        if (oldRequestStatus == RequestStatus.CANCELLED && 
            newRequestStatus != RequestStatus.CANCELLED) {
            throw new IllegalStateException("Cannot modify a cancelled request");
        }

        if (oldMaintenanceStatus == MaintenanceStatus.COMPLETED && 
            newMaintenanceStatus != MaintenanceStatus.COMPLETED) {
            throw new IllegalStateException("Cannot modify a completed maintenance");
        }

        // Kiá»ƒm tra luá»“ng tráº¡ng thÃ¡i há»£p lá»‡
        if (oldMaintenanceStatus != null && newMaintenanceStatus != null) {
            validateMaintenanceStatusTransition(oldMaintenanceStatus, newMaintenanceStatus);
        }
    }

    private void validateMaintenanceStatusTransition(MaintenanceStatus oldStatus, MaintenanceStatus newStatus) {
        // Äá»‹nh nghÄ©a cÃ¡c chuyá»ƒn Ä‘á»•i tráº¡ng thÃ¡i há»£p lá»‡
        boolean isValidTransition = switch (oldStatus) {
            case ASSIGNED -> newStatus == MaintenanceStatus.SCHEDULED || newStatus == MaintenanceStatus.IN_PROGRESS;
            case SCHEDULED -> newStatus == MaintenanceStatus.IN_PROGRESS;
            case IN_PROGRESS -> newStatus == MaintenanceStatus.COMPLETED;
            case COMPLETED -> newStatus == MaintenanceStatus.COMPLETED; // KhÃ´ng cho phÃ©p thay Ä‘á»•i
            default -> false;
        };

        if (!isValidTransition) {
            throw new IllegalStateException(
                String.format("Invalid maintenance status transition from %s to %s", oldStatus, newStatus)
            );
        }
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

    public ReviewDTO createReview(String maintenanceRequestId, ReviewDTO reviewDTO, String customerId) {
        MaintenanceRequest maintenanceRequest = findMaintenanceRequestById(maintenanceRequestId);

        if (maintenanceRequest.getMaintenanceStatus() != MaintenanceRequest.MaintenanceStatus.COMPLETED) {
            throw new IllegalStateException("Cannot review a maintenance request that is not completed");
        }

        if (!maintenanceRequest.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Customer can only review their own maintenance requests");
        }

        // Kiá»ƒm tra xem Ä‘Ã£ cÃ³ Ä‘Ã¡nh giÃ¡ chÆ°a
        Optional<Review> existingReview = reviewRepository.findByMaintenanceRequestId(maintenanceRequestId);
        if (existingReview.isPresent()) {
            throw new IllegalStateException("A review already exists for this maintenance request");
        }

        Review review = new Review();
        review.setMaintenanceRequest(maintenanceRequest);
        review.setCustomer(userRepository.findById(customerId).orElseThrow(() -> new ResourceNotFoundException("Customer not found")));
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        review.setReviewDate(LocalDateTime.now());
        review.setStatus("SUBMITTED");

        Review savedReview = reviewRepository.save(review);
        return convertToReviewDTO(savedReview);
    }

    public ReviewDTO getReviewForMaintenanceRequest(String maintenanceRequestId) {
        return reviewRepository.findByMaintenanceRequestId(maintenanceRequestId)
            .map(this::convertToReviewDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found for maintenance request: " + maintenanceRequestId));
    }

    public List<MaintenanceRequestDTO> getReviewingMaintenanceRequests() {
        return maintenanceRequestRepository.findByRequestStatus(MaintenanceRequest.RequestStatus.REVIEWING)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<MaintenanceRequestDTO> getAllCompletedMaintenanceRequests() {
        return maintenanceRequestRepository.findByMaintenanceStatus(MaintenanceRequest.MaintenanceStatus.COMPLETED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<MaintenanceRequestDTO> getCompletedMaintenanceRequestsForStaff(String staffId) {
        return maintenanceRequestRepository.findByAssignedToIdAndMaintenanceStatus(
            staffId, MaintenanceRequest.MaintenanceStatus.COMPLETED)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public MaintenanceRequestDTO updatePendingMaintenanceRequest(String id, MaintenanceRequestDTO updatedDTO, String customerId) {
        MaintenanceRequest request = findMaintenanceRequestById(id);

        if (request.getRequestStatus() != MaintenanceRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Can only update maintenance requests in PENDING status");
        }

        if (!request.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Customers can only update their own maintenance requests");
        }

        // Update only allowed fields
        request.setDescription(updatedDTO.getDescription());
        request.setAttachments(updatedDTO.getAttachments());
        request.setUpdatedAt(LocalDateTime.now());

        MaintenanceRequest updatedRequest = maintenanceRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    public MaintenanceRequestDTO confirmDepositCashPayment(String id, String consultantId) {
        return updateMaintenanceRequest(id, request -> {
            // Validate consultant
            if (!request.getConsultant().getId().equals(consultantId)) {
                throw new IllegalArgumentException("Only assigned consultant can confirm payment");
            }

            // Validate request status
            if (request.getRequestStatus() != RequestStatus.CONFIRMED) {
                throw new IllegalStateException("Can only make deposit payment for CONFIRMED requests");
            }

            // Validate payment status
            if (request.getPaymentStatus() != PaymentStatus.UNPAID) {
                throw new IllegalStateException("Request has already been paid");
            }

            // Calculate deposit amount (50%)
            BigDecimal depositAmount = request.getAgreedPrice().multiply(BigDecimal.valueOf(0.5));
            BigDecimal remainingAmount = request.getAgreedPrice().subtract(depositAmount);

            // Update payment info
            request.setPaymentMethod(PaymentMethod.CASH);
            request.setPaymentStatus(PaymentStatus.DEPOSIT_PAID);
            request.setDepositAmount(depositAmount);
            request.setRemainingAmount(remainingAmount);
        });
    }

    public MaintenanceRequestDTO confirmFinalCashPayment(String id, String consultantId) {
        return updateMaintenanceRequest(id, request -> {
            // Validate consultant
            if (!request.getConsultant().getId().equals(consultantId)) {
                throw new IllegalArgumentException("Only assigned consultant can confirm payment");
            }

            // Validate maintenance status
            if (request.getMaintenanceStatus() != MaintenanceStatus.COMPLETED) {
                throw new IllegalStateException("Can only make final payment for COMPLETED maintenance");
            }

            // Validate payment status
            if (request.getPaymentStatus() != PaymentStatus.DEPOSIT_PAID) {
                throw new IllegalStateException("Must pay deposit first");
            }

            // Update payment info
            request.setPaymentMethod(PaymentMethod.CASH);
            request.setPaymentStatus(PaymentStatus.FULLY_PAID);
        });
    }

    public String createDepositVnpayPayment(String id, String customerId, HttpServletRequest httpRequest) {
        MaintenanceRequest request = findMaintenanceRequestById(id);

        // Validate customer
        if (!request.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Only request owner can make payment");
        }

        // Validate status
        if (request.getRequestStatus() != RequestStatus.CONFIRMED) {
            throw new IllegalStateException("Can only make deposit payment for CONFIRMED requests");
        }

        // Calculate deposit amount
        BigDecimal depositAmount = request.getAgreedPrice().multiply(BigDecimal.valueOf(0.5));

        // Create VNPay URL
        return vnPayService.createPaymentUrl(
            id,
            depositAmount.longValue() * 100, // Convert to VND cents
            "MAINTENANCE_DEPOSIT",
            httpRequest
        );
    }

    public String createFinalVnpayPayment(String id, String customerId, HttpServletRequest httpRequest) {
        MaintenanceRequest request = findMaintenanceRequestById(id);

        // Validate customer
        if (!request.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Only request owner can make payment");
        }

        // Validate status
        if (request.getMaintenanceStatus() != MaintenanceStatus.COMPLETED) {
            throw new IllegalStateException("Can only make final payment for COMPLETED maintenance");
        }

        // Get remaining amount
        BigDecimal remainingAmount = request.getRemainingAmount();

        // Create VNPay URL
        return vnPayService.createPaymentUrl(
            id,
            remainingAmount.longValue() * 100, // Convert to VND cents
            "MAINTENANCE_FINAL",
            httpRequest
        );
    }

    public MaintenanceRequestDTO processVnPayCallback(String id, String vnp_ResponseCode, String paymentType) {
        return updateMaintenanceRequest(id, request -> {
            if (!"00".equals(vnp_ResponseCode)) {
                throw new IllegalStateException("Payment failed with response code: " + vnp_ResponseCode);
            }

            if ("MAINTENANCE_DEPOSIT".equals(paymentType)) {
                // Process deposit payment
                BigDecimal depositAmount = request.getAgreedPrice().multiply(BigDecimal.valueOf(0.5));
                BigDecimal remainingAmount = request.getAgreedPrice().subtract(depositAmount);

                request.setPaymentMethod(PaymentMethod.VNPAY);
                request.setPaymentStatus(PaymentStatus.DEPOSIT_PAID);
                request.setDepositAmount(depositAmount);
                request.setRemainingAmount(remainingAmount);
            } else if ("MAINTENANCE_FINAL".equals(paymentType)) {
                // Process final payment
                request.setPaymentMethod(PaymentMethod.VNPAY);
                request.setPaymentStatus(PaymentStatus.FULLY_PAID);
            }
        });
    }

    private ReviewDTO convertToReviewDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setMaintenanceRequestId(review.getMaintenanceRequest().getId());
        dto.setCustomerId(review.getCustomer().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setReviewDate(review.getReviewDate());
        dto.setStatus(review.getStatus());
        return dto;
    }

    public List<MaintenanceRequestDTO> getCompletedUnpaidRequests() {
        return maintenanceRequestRepository.findByMaintenanceStatusAndPaymentStatusIn(
                MaintenanceStatus.COMPLETED,
                List.of(PaymentStatus.UNPAID, PaymentStatus.DEPOSIT_PAID))
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}
