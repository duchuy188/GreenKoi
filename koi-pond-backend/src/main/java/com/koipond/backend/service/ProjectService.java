package com.koipond.backend.service;

import com.koipond.backend.dto.*;
import com.koipond.backend.model.*;
import com.koipond.backend.repository.*;
import com.koipond.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;

@Service
public class ProjectService {
    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;
    private final PromotionRepository promotionRepository;
    private final ProjectStatusRepository projectStatusRepository;
    private final ProjectCancellationRepository projectCancellationRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository,
                         UserRepository userRepository,
                         DesignRepository designRepository,
                         PromotionRepository promotionRepository,
                         ProjectStatusRepository projectStatusRepository,
                         ProjectCancellationRepository projectCancellationRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
        this.promotionRepository = promotionRepository;
        this.projectStatusRepository = projectStatusRepository;
        this.projectCancellationRepository = projectCancellationRepository;
    }

    public List<ProjectDTO> getAllProjects() {
        log.info("Fetching all projects");
        return projectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByConsultant(String consultantUsername) {
        log.info("Fetching projects for consultant: {}", consultantUsername);
        User consultant = getUserByUsername(consultantUsername);
        return projectRepository.findByConsultantId(consultant.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request, String consultantUsername) {
        User consultant = getUserByUsername(consultantUsername);
        User customer = getUserById(request.getCustomerId());
        
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCustomer(customer);
        project.setConsultant(consultant);
        project.setDesign(getDesignById(request.getDesignId()));
        project.setPromotion(getPromotionById(request.getPromotionId()));
        project.setTotalPrice(request.getTotalPrice());
        project.setDepositAmount(request.getDepositAmount());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setAddress(request.getAddress());

        ProjectStatus pendingStatus = getProjectStatusByName("PENDING");
        project.setStatus(pendingStatus);
        log.info("Set project status to: {}", pendingStatus.getName());

        // Default fields
        project.setProgressPercentage(0);
        project.setPaymentStatus("PENDING");
        project.setTotalStages(0);
        project.setCompletedStages(0);
        project.setActive(true);

        log.info("Saving new project: {}", project);
        Project savedProject = projectRepository.save(project);
        log.info("Project saved successfully with ID: {}", savedProject.getId());
        return convertToDTO(savedProject);
    }

    @Transactional
    public ProjectDTO updateProject(String id, UpdateProjectRequest request, String consultantUsername) {
        log.info("Updating project with id: {}", id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (!project.getConsultant().getUsername().equals(consultantUsername)) {
            log.warn("Consultant {} attempted to update project {} which they are not assigned to", consultantUsername, id);
            throw new AccessDeniedException("You don't have permission to update this project. Only the assigned consultant can update the project.");
        }

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getTotalPrice() != null) project.setTotalPrice(request.getTotalPrice());
        if (request.getDepositAmount() != null) project.setDepositAmount(request.getDepositAmount());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (request.getAddress() != null) project.setAddress(request.getAddress());

        if (request.getDesignId() != null) {
            Design design = getDesignById(request.getDesignId());
            project.setDesign(design);
        }
        if (request.getPromotionId() != null) {
            Promotion promotion = getPromotionById(request.getPromotionId());
            project.setPromotion(promotion);
        }

        project.setUpdatedAt(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);
        log.info("Project updated successfully: {}", updatedProject.getId());
        return convertToDTO(updatedProject);
    }

    @Transactional
    public ProjectDTO updateProjectStatus(String id, String newStatus, String username, boolean isManager) {
        log.info("Updating status of project with id: {} to {}. User: {}, IsManager: {}", id, newStatus, username, isManager);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (!isManager && !project.getConsultant().getUsername().equals(username)) {
            log.warn("Access denied for user {} to update project {} status. IsManager: {}, Project Consultant: {}", 
                     username, id, isManager, project.getConsultant().getUsername());
            throw new AccessDeniedException("You don't have permission to update this project's status");
        }

        ProjectStatus status = getProjectStatusByName(newStatus);
        
        if (!isValidStatusTransition(project.getStatus(), status)) {
            throw new IllegalStateException("Invalid status transition from " + project.getStatus().getName() + " to " + newStatus);
        }

        project.setStatus(status);
        project.setUpdatedAt(LocalDateTime.now());

        updateProjectFieldsBasedOnStatus(project, status);

        Project updatedProject = projectRepository.save(project);
        log.info("Project status updated successfully: {}", updatedProject.getId());
        return convertToDTO(updatedProject);
    }

    @Transactional
    public ProjectDTO cancelProject(String id, CancelProjectRequest request, String username, boolean isManager) {
        log.info("Cancelling project with id: {}. User: {}, IsManager: {}", id, username, isManager);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (!isManager && !project.getConsultant().getUsername().equals(username)) {
            log.warn("Access denied for user {} to cancel project {}. IsManager: {}, Project Consultant: {}", 
                     username, id, isManager, project.getConsultant().getUsername());
            throw new AccessDeniedException("You don't have permission to cancel this project");
        }

        ProjectStatus cancelledStatus = getProjectStatusByName("CANCELLED");
        project.setStatus(cancelledStatus);
        project.setActive(false);
        project.setUpdatedAt(LocalDateTime.now());

        ProjectCancellation cancellation = new ProjectCancellation();
        cancellation.setProject(project);
        cancellation.setReason(request.getReason());
        // Thay đổi ở đây: sử dụng getUserByUsername thay vì getUserById
        cancellation.setRequestedBy(getUserByUsername(username));
        cancellation.setStatus(isManager ? "APPROVED" : "PENDING");
        cancellation.setCancellationDate(LocalDateTime.now());

        projectCancellationRepository.save(cancellation);

        Project cancelledProject = projectRepository.save(project);
        log.info("Project cancelled: {}", cancelledProject.getId());
        return convertToDTO(cancelledProject);
    }

    private User getUserById(String id) {
        log.debug("Fetching user with id: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with id: {}", id);
                    return new ResourceNotFoundException("User not found with id: " + id);
                });
    }

    private Design getDesignById(String id) {
        if (id == null) return null;
        log.debug("Fetching design with id: {}", id);
        return designRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Design not found with id: {}", id);
                    return new ResourceNotFoundException("Design not found with id: " + id);
                });
    }

    private Promotion getPromotionById(String id) {
        if (id == null) return null;
        log.debug("Fetching promotion with id: {}", id);
        return promotionRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Promotion not found with id: {}", id);
                    return new ResourceNotFoundException("Promotion not found with id: " + id);
                });
    }

    private ProjectStatus getProjectStatusByName(String name) {
        log.debug("Fetching project status with name: {}", name);
        return projectStatusRepository.findByName(name)
                .orElseThrow(() -> {
                    log.error("Project status '{}' not found in database", name);
                    return new ResourceNotFoundException("Project status not found with name: " + name);
                });
    }

    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        if (project.getStatus() != null) {
            dto.setStatusId(project.getStatus().getId());
            dto.setStatusName(project.getStatus().getName());
        }
        dto.setTotalPrice(project.getTotalPrice());
        dto.setDepositAmount(project.getDepositAmount());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        if (project.getCustomer() != null) {
            dto.setCustomerId(project.getCustomer().getId());
        }
        if (project.getConsultant() != null) {
            dto.setConsultantId(project.getConsultant().getId());
        }
        if (project.getDesign() != null) {
            dto.setDesignId(project.getDesign().getId());
        }
        if (project.getPromotion() != null) {
            dto.setPromotionId(project.getPromotion().getId());
        }
        dto.setDiscountedPrice(project.getDiscountedPrice());
        dto.setAddress(project.getAddress());
        dto.setActive(project.isActive());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }

    private boolean isValidStatusTransition(ProjectStatus currentStatus, ProjectStatus newStatus) {
        return switch (currentStatus.getName()) {
            case "PENDING" -> newStatus.getName().equals("APPROVED") || newStatus.getName().equals("CANCELLED");
            case "APPROVED" -> newStatus.getName().equals("PLANNING");
            case "PLANNING" -> newStatus.getName().equals("IN_PROGRESS");
            case "IN_PROGRESS" -> newStatus.getName().equals("ON_HOLD") || newStatus.getName().equals("COMPLETED") || newStatus.getName().equals("MAINTENANCE");
            case "ON_HOLD" -> newStatus.getName().equals("IN_PROGRESS") || newStatus.getName().equals("CANCELLED");
            case "MAINTENANCE" -> newStatus.getName().equals("COMPLETED") || newStatus.getName().equals("IN_PROGRESS");
            case "COMPLETED", "CANCELLED" -> false;
            default -> false;
        };
    }

    private void updateProjectFieldsBasedOnStatus(Project project, ProjectStatus newStatus) {
        switch (newStatus.getName()) {
            case "APPROVED":
                project.setApprovalDate(LocalDate.now());
                break;
            case "IN_PROGRESS":
                if (project.getStartDate() == null) {
                    project.setStartDate(LocalDate.now());
                }
                break;
            case "COMPLETED":
                project.setCompletionDate(LocalDate.now());
                break;
            case "CANCELLED":
                project.setActive(false);
                break;

        }
    }

    private User getUserByUsername(String username) {
        log.debug("Fetching user with username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found with username: {}", username);
                    return new ResourceNotFoundException("User not found with username: " + username);
                });
    }
}