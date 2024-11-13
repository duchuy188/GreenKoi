package com.koipond.backend.service;

import com.koipond.backend.model.ConsultationRequest;
import com.koipond.backend.model.Project;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.model.ProjectStatus;
import com.koipond.backend.model.Task;
import com.koipond.backend.model.TaskTemplate;
import com.koipond.backend.model.Review;
import com.koipond.backend.model.DesignRequest;
import com.koipond.backend.model.Promotion;

import com.koipond.backend.dto.ProjectDTO;
import com.koipond.backend.dto.TaskDTO;
import com.koipond.backend.dto.ReviewDTO;
import com.koipond.backend.dto.CreateProjectRequest;
import com.koipond.backend.dto.UpdateProjectRequest;
import com.koipond.backend.dto.CancelProjectRequest;
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
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.math.BigDecimal;

@Service
public class ProjectService {
    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;
    private final PromotionRepository promotionRepository;
    private final ProjectStatusRepository projectStatusRepository;
    private final TaskRepository taskRepository;
    private final TaskTemplateRepository taskTemplateRepository;
    private final TaskService taskService;
    private final ReviewRepository reviewRepository;
    private final VNPayService vnPayService;
    private final DesignRequestRepository designRequestRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository,
                         UserRepository userRepository,
                         DesignRepository designRepository,
                         PromotionRepository promotionRepository,
                         ProjectStatusRepository projectStatusRepository,
                         TaskRepository taskRepository,
                         TaskTemplateRepository taskTemplateRepository,
                         TaskService taskService,
                         ReviewRepository reviewRepository,
                         VNPayService vnPayService,
                         DesignRequestRepository designRequestRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
        this.promotionRepository = promotionRepository;
        this.projectStatusRepository = projectStatusRepository;
        this.taskRepository = taskRepository;
        this.taskTemplateRepository = taskTemplateRepository;
        this.taskService = taskService;
        this.reviewRepository = reviewRepository;
        this.vnPayService = vnPayService;
        this.designRequestRepository = designRequestRepository;
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
        project.calculateRemainingAmount();  // Thêm dòng này
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setAddress(request.getAddress());

        ProjectStatus pendingStatus = getProjectStatusByName("PENDING");
        project.setStatus(pendingStatus);
        log.info("Set project status to: {}", pendingStatus.getName());

        // Default fields
        project.setProgressPercentage(0);
        project.setPaymentStatus(Project.PaymentStatus.UNPAID);
        project.setTotalStages(0);
        project.setCompletedStages(0);
        project.setActive(true);

        log.info("Saving new project: {}", project);
        Project savedProject = projectRepository.save(project);
        log.info("Project saved successfully with ID: {}", savedProject.getId());

        // Thêm dòng này
        createTasksForProject(savedProject.getId());

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
        if (request.getTotalPrice() != null) {
            project.setTotalPrice(request.getTotalPrice());
            project.calculateRemainingAmount();  // Thêm dòng này
        }
        if (request.getDepositAmount() != null) {
            project.setDepositAmount(request.getDepositAmount());
            project.calculateRemainingAmount();  // Thêm dòng này
        }
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
    public ProjectDTO updateProjectStatus(String id, String newStatus, String username) {
        synchronized (id.intern()) {
            Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

            User user = getUserByUsername(username);
            
            // Thêm validation cho ROLE_2
            if (user.getRoleId().equals("2")) {
                // Consultant không được phép set TECHNICALLY_COMPLETED
                if ("TECHNICALLY_COMPLETED".equals(newStatus)) {
                    throw new AccessDeniedException("Consultant cannot mark project as technically completed");
                }
                
                // Chỉ cho phép consultant update một số status nhất định
                List<String> allowedStatuses = Arrays.asList(
                    "APPROVED", "CANCELLED", "ON_HOLD", "IN_PROGRESS"
                );
                if (!allowedStatuses.contains(newStatus)) {
                    throw new AccessDeniedException(
                        "Consultant can only update to: " + String.join(", ", allowedStatuses)
                    );
                }
            }

            // Kiểm tra quyền trực tiếp từ role
            if (!user.getRoleId().equals("1") && !project.getConsultant().getUsername().equals(username)) {
                throw new AccessDeniedException("You don't have permission to update this project's status");
            }

            if ("COMPLETED".equalsIgnoreCase(newStatus)) {
                throw new IllegalArgumentException("To mark a project as completed, use the completeProject method.");
            }

            ProjectStatus status = getProjectStatusByName(newStatus);

            if (!isValidStatusTransition(project.getStatus(), status)) {
                throw new IllegalStateException("Invalid status transition from " + project.getStatus().getName() + " to " + newStatus);
            }

            if ("APPROVED".equals(newStatus) && project.getPaymentStatus() != Project.PaymentStatus.DEPOSIT_PAID) {
                throw new IllegalStateException("Project cannot be approved until payment is completed");
            }

            project.setStatus(status);
            project.setUpdatedAt(LocalDateTime.now());

            updateProjectFieldsBasedOnStatus(project, status);
            updateConstructorActiveStatus(project);

            Project updatedProject = projectRepository.save(project);
            log.info("Project status updated successfully: {}", updatedProject.getId());
            return convertToDTO(updatedProject);
        }
    }

    @Transactional
    public ProjectDTO cancelProject(String id, CancelProjectRequest request, String username) {
        Project project = getProjectById(id);
        User user = getUserByUsername(username);
        boolean isManager = user.getRoleId().equals("1");

        // Validate project state
        validateProjectCancellation(project, user, isManager);

        // Cập nhật trạng thái
        ProjectStatus cancelledStatus = getProjectStatusByName("CANCELLED");
        project.setStatus(cancelledStatus);
        updateProjectFieldsBasedOnStatus(project, cancelledStatus);
        updateConstructorActiveStatus(project);
        project.setUpdatedAt(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);
        log.info("Project {} cancelled successfully by {}", id, username);
        return convertToDTO(updatedProject);
    }

    private void validateProjectCancellation(Project project, User user, boolean isManager) {
        if ("COMPLETED".equals(project.getStatus().getName())) {
            throw new IllegalStateException("Cannot cancel a completed project");
        }

        if ("CANCELLED".equals(project.getStatus().getName())) {
            throw new IllegalStateException("Project is already cancelled");
        }

        if (project.getPaymentStatus() == Project.PaymentStatus.FULLY_PAID) {
            throw new IllegalStateException("Cannot cancel project that has been fully paid");
        }

        if (!isManager && !project.getConsultant().getUsername().equals(user.getUsername())) {
            throw new AccessDeniedException("You don't have permission to cancel this project");
        }

        if (!isManager) {
            List<String> allowedStatusesForConsultant = Arrays.asList(
                "PENDING", "APPROVED", "IN_PROGRESS", "ON_HOLD"
            );
            if (!allowedStatusesForConsultant.contains(project.getStatus().getName())) {
                throw new AccessDeniedException(
                    "Consultant cannot cancel project in current status: " + project.getStatus().getName()
                );
            }
        }
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
        dto.setRemainingAmount(project.getRemainingAmount());  // Thêm dòng này
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
        if (project.getConstructor() != null) {
            dto.setConstructorId(project.getConstructor().getId());
        }
        dto.setPaymentStatus(project.getPaymentStatus());
        // Thêm các trường này
        dto.setProgressPercentage(project.getProgressPercentage());
        dto.setTechnicalCompletionDate(project.getTechnicalCompletionDate());
        dto.setTasks(taskRepository.findByProjectIdOrderByOrderIndexAsc(project.getId())
                .stream()
                .map(this::convertToTaskDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    private boolean isValidStatusTransition(ProjectStatus currentStatus, ProjectStatus newStatus) {
        return switch (currentStatus.getName()) {
            case "PENDING" -> List.of("APPROVED", "CANCELLED").contains(newStatus.getName());
            case "APPROVED" -> List.of("IN_PROGRESS", "CANCELLED").contains(newStatus.getName());
            case "IN_PROGRESS" -> List.of("ON_HOLD", "CANCELLED", "TECHNICALLY_COMPLETED").contains(newStatus.getName());
            case "ON_HOLD" -> List.of("IN_PROGRESS", "CANCELLED").contains(newStatus.getName());
            case "TECHNICALLY_COMPLETED" -> List.of("COMPLETED").contains(newStatus.getName());
            case "MAINTENANCE" -> List.of("IN_PROGRESS").contains(newStatus.getName());
            case "COMPLETED", "CANCELLED" -> false;
            default -> false;
        };
    }

    private void updateProjectFieldsBasedOnStatus(Project project, ProjectStatus newStatus) {
        switch (newStatus.getName()) {
            case "APPROVED":
                project.setApprovalDate(LocalDate.now());
                project.setCompletedStages(1);
                break;

            case "IN_PROGRESS":
                if (project.getStartDate() == null) {
                    project.setStartDate(LocalDate.now());
                }
                project.setCompletedStages(2);
                break;

            case "TECHNICALLY_COMPLETED":
                project.setTechnicalCompletionDate(LocalDate.now());
                project.setProgressPercentage(100);
                project.setCompletedStages(project.getTotalStages() - 1);
                break;

            case "COMPLETED":
                project.setCompletionDate(LocalDate.now());
                project.setCompletedStages(project.getTotalStages());
                releaseConstructor(project);
                break;

            case "CANCELLED":
                project.setActive(false);
                releaseConstructor(project);
                break;
        }
    }

    private void releaseConstructor(Project project) {
        if (project.getConstructor() != null) {
            User constructor = project.getConstructor();
            constructor.setHasActiveProject(false);
            userRepository.save(constructor);
            log.info("Released constructor {} from project {}", 
                    constructor.getUsername(), project.getId());
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

    @PreAuthorize("hasRole('ROLE_1')")
    @Transactional
    public ProjectDTO assignConstructorToProject(String projectId, String constructorId, String managerUsername) {
        Project project = getProjectById(projectId);
        User constructor = getUserById(constructorId);

        // Kiểm tra quyền manager
        User manager = getUserByUsername(managerUsername);
        if (!manager.getRoleId().equals("1")) {
            throw new AccessDeniedException("Only managers can assign constructors");
        }

        // Kiểm tra trạng thái dự án
        if (!"APPROVED".equals(project.getStatus().getName())) {
            throw new IllegalStateException("Project must be APPROVED before assigning constructor");
        }

        // Kiểm tra payment status
        if (!Project.PaymentStatus.DEPOSIT_PAID.equals(project.getPaymentStatus())) {
            throw new IllegalStateException("Project must be DEPOSIT_PAID before assigning constructor");
        }

        // Kiểm tra constructor có phải role 4 không
        if (!constructor.getRoleId().equals("4")) {
            throw new IllegalStateException("Can only assign users with constructor role");
        }

        // Kiểm tra constructor có project đang active không
        if (projectRepository.existsByConstructorIdAndStatusNameNotIn(
                constructor.getId(), 
                Arrays.asList("COMPLETED", "CANCELLED"))) {
            throw new IllegalStateException("Constructor is currently busy with another project");
        }

        // Cập nhật project và constructor
        project.setConstructor(constructor);
        project.setUpdatedAt(LocalDateTime.now());
        constructor.setHasActiveProject(true);

        // Chuyển trạng thái sang IN_PROGRESS
        ProjectStatus inProgressStatus = getProjectStatusByName("IN_PROGRESS");
        project.setStatus(inProgressStatus);

        userRepository.save(constructor);
        Project updatedProject = projectRepository.save(project);

        log.info("Constructor assigned successfully to project {}", projectId);
        return convertToDTO(updatedProject);
    }

    @Transactional
    public ProjectDTO completeProject(String projectId, String managerUsername) {
        Project project = getProjectById(projectId);
        validateProjectCompletion(project, managerUsername);

        ProjectStatus completedStatus = getProjectStatusByName("COMPLETED");
        project.setStatus(completedStatus);
        updateProjectFieldsBasedOnStatus(project, completedStatus);
        updateConstructorActiveStatus(project);
        project.setUpdatedAt(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);
        log.info("Project {} completed successfully by manager {}", projectId, managerUsername);
        return convertToDTO(updatedProject);
    }

    private void validateProjectCompletion(Project project, String managerUsername) {
        User manager = getUserByUsername(managerUsername);
        if (!manager.getRoleId().equals("1")) {
            throw new AccessDeniedException("Only managers can complete projects");
        }

        if (!Project.PaymentStatus.FULLY_PAID.equals(project.getPaymentStatus())) {
            throw new IllegalStateException("Project must be fully paid before it can be marked as completed");
        }

        if (!"TECHNICALLY_COMPLETED".equals(project.getStatus().getName())) {
            throw new IllegalStateException("Project must be technically completed before it can be marked as completed");
        }
    }

    @Transactional
    public void createTasksForProject(String projectId) {
        log.info("Creating tasks for project with id: {}", projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<TaskTemplate> templates = taskTemplateRepository.findAllByOrderByOrderIndexAsc();
        log.info("Found {} task templates", templates.size());

        for (TaskTemplate template : templates) {
            Task task = new Task();
            task.setProject(project);
            task.setName(template.getName());
            task.setDescription(template.getDescription());
            task.setStatus("PENDING");
            task.setOrderIndex(template.getOrderIndex());
            task.setCompletionPercentage(0);
            task.setCreatedAt(LocalDateTime.now()); // Thm dòng này
            task.setUpdatedAt(LocalDateTime.now()); // Thêm dòng này nếu cần
            Task savedTask = taskRepository.save(task);
            log.info("Created task: {} for project: {}", savedTask.getId(), projectId);
        }
        log.info("Tasks created successfully for project: {}", projectId);
    }

    @PreAuthorize("hasAnyRole('ROLE_1', 'ROLE_4')")
    public List<TaskDTO> getTasksByProjectId(String projectId, String username) {
        log.info("Fetching tasks for project: {} by user: {}", projectId, username);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User user = getUserByUsername(username);
        log.info("User role: {}", user.getRoleId());

        // Kiểm tra quyền truy cập
        if (!user.getRoleId().equals("1") && !user.getRoleId().equals("4")) {
            log.warn("Access denied for user {} with role {} to view tasks for project {}", username, user.getRoleId(), projectId);
            throw new AccessDeniedException("You don't have permission to view tasks for this project");
        }

        // Nếu là Constructor, kiểm tra xem họ có phải là người được gán cho dự án không
        if (user.getRoleId().equals("4")) {
            if (project.getConstructor() == null || !project.getConstructor().getId().equals(user.getId())) {
                log.warn("Constructor {} is not assigned to project {}", username, projectId);
                throw new AccessDeniedException("You are not assigned to this project");
            }
        }

        log.info("User {} with role {} is accessing tasks for project {}", username, user.getRoleId(), projectId);
        List<Task> tasks = taskRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
        log.info("Found {} tasks for project {}", tasks.size(), projectId);

        return tasks.stream()
            .map(task -> {
                TaskDTO dto = convertToTaskDTO(task);
                if (dto.getProjectId() == null) {
                    log.warn("Task {} has null projectId", task.getId());
                    dto.setProjectId(projectId);
                }
                return dto;
            })
            .collect(Collectors.toList());
    }

    private TaskDTO convertToTaskDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setProjectId(task.getProject().getId());  // Thêm dòng này
        dto.setName(task.getName());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setOrderIndex(task.getOrderIndex());
        dto.setCompletionPercentage(task.getCompletionPercentage());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setNotes(task.getNotes());  // Thêm dòng ny nếu bạn muốn bao gồm notes
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsByCustomer(String customerUsername) {
        log.info("Fetching projects for customer: {}", customerUsername);
        User customer = getUserByUsername(customerUsername);
        List<Project> projects = projectRepository.findByCustomerId(customer.getId());
        return projects.stream()
                .map(this::convertToCustomerProjectDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDTO getCustomerProjectDetails(String projectId, String customerUsername) {
        log.info("Fetching project details for customer: {}, projectId: {}", customerUsername, projectId);
        User customer = getUserByUsername(customerUsername);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getCustomer().getId().equals(customer.getId())) {
            log.warn("Customer {} attempted to access project {} which they don't own", customerUsername, projectId);
            throw new AccessDeniedException("You don't have permission to view this project");
        }

        ProjectDTO dto = convertToCustomerProjectDTO(project);

        // Add review information if exists
        reviewRepository.findByProjectId(projectId).ifPresent(review -> {
            ReviewDTO reviewDTO = convertToReviewDTO(review);
            dto.setReview(reviewDTO);
        });

        return dto;
    }

    private ProjectDTO convertToCustomerProjectDTO(Project project) {
        ProjectDTO dto = convertToDTO(project);

        // Thêm thông tin về các task
        List<TaskDTO> taskDTOs = taskRepository.findByProjectIdOrderByOrderIndexAsc(project.getId()).stream()
                .map(this::convertToTaskDTO)
                .collect(Collectors.toList());
        dto.setTasks(taskDTOs);

        // Thêm các trường mới
        dto.setProgressPercentage(project.getProgressPercentage());
        dto.setPaymentStatus(project.getPaymentStatus());
        dto.setEstimatedCompletionDate(project.getEstimatedCompletionDate());
        dto.setTotalStages(project.getTotalStages());
        dto.setCompletedStages(project.getCompletedStages());

        return dto;
    }

    public Project getProjectById(String id) {
        log.debug("Fetching project with id: {}", id);
        return projectRepository.findById(id)
            .orElseThrow(() -> {
                log.error("Project not found with id: {}", id);
                return new ResourceNotFoundException("Project not found with id: " + id);
            });
    }

    @Transactional
    public ReviewDTO createProjectReview(String projectId, ReviewDTO reviewDTO, String customerUsername) {
        log.info("Creating review for project: {} by customer: {}", projectId, customerUsername);
        Project project = getProjectById(projectId);
        User customer = getUserByUsername(customerUsername);

        if (!project.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You can only review your own projects");
        }

        if (!project.getStatus().getName().equals("COMPLETED")) {
            throw new IllegalStateException("Cannot review a project that is not completed");
        }

        if (reviewRepository.existsByProjectId(projectId)) {
            throw new IllegalStateException("A review already exists for this project");
        }

        Review review = new Review();
        review.setProject(project);
        review.setCustomer(customer);
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        review.setReviewDate(LocalDateTime.now());
        review.setStatus("SUBMITTED");

        Review savedReview = reviewRepository.save(review);
        log.info("Review created successfully for project: {}", projectId);
        return convertToReviewDTO(savedReview);
    }

    public ReviewDTO getProjectReview(String projectId, String username) {
        log.info("Fetching review for project: {} requested by user: {}", projectId, username);
        User user = getUserByUsername(username);
        Project project = getProjectById(projectId);

        // Check if user has permission to view the review
        if (!canUserViewProjectReview(user, project)) {
            throw new AccessDeniedException("You don't have permission to view this project's review");
        }

        return reviewRepository.findByProjectId(projectId)
            .map(this::convertToReviewDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found for project: " + projectId));
    }

    private boolean canUserViewProjectReview(User user, Project project) {
        return user.getRoleId().equals("1") || // Manager
               user.getRoleId().equals("2") && project.getConsultant().getId().equals(user.getId()) || // Consultant assigned to the project
               user.getRoleId().equals("4") && project.getConstructor() != null && project.getConstructor().getId().equals(user.getId()) || // Construction staff assigned to the project
               user.getRoleId().equals("5") && project.getCustomer().getId().equals(user.getId()); // Customer of the project
    }

    private ReviewDTO convertToReviewDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setProjectId(review.getProject().getId());
        dto.setCustomerId(review.getCustomer().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setReviewDate(review.getReviewDate());
        dto.setStatus(review.getStatus());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsAssignedToConstructor(String constructorUsername) {
        log.info("Fetching projects assigned to constructor: {}", constructorUsername);
        User constructor = getUserByUsername(constructorUsername);
        if (!constructor.getRoleId().equals("4")) {
            throw new AccessDeniedException("Only construction staff can access this endpoint");
        }
        List<Project> projects = projectRepository.findByConstructorId(constructor.getId());
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public String createPaymentUrl(String projectId, HttpServletRequest request) {
        Project project = getProjectById(projectId);
        long amount;
        String paymentType;

        if (project.getPaymentStatus() == Project.PaymentStatus.UNPAID) {
            // Nếu chưa thanh toán, lấy số tiền đặt cọc
            amount = project.getDepositAmount().longValue() * 100; // Nhân 100 vì VNPay yêu cầu
            paymentType = "PROJECT_DEPOSIT";
        } else if (project.getPaymentStatus() == Project.PaymentStatus.DEPOSIT_PAID 
                   && "TECHNICALLY_COMPLETED".equals(project.getStatus().getName())) {
            // Nếu đã đặt cọc và hoàn thành kỹ thuật, lấy số tiền còn lại
            amount = project.getRemainingAmount().longValue() * 100;
            paymentType = "PROJECT_FINAL";
        } else {
            throw new IllegalStateException("Invalid payment state");
        }

        return vnPayService.createPaymentUrl(projectId, amount, paymentType, request);
    }

    @Transactional
    public void processPaymentResult(String projectId, String vnp_ResponseCode) {
        synchronized (projectId.intern()) {
            Project project = getProjectById(projectId);

            if ("00".equals(vnp_ResponseCode)) {
                if (project.getPaymentStatus() == Project.PaymentStatus.UNPAID) {
                    // Nếu là thanh toán đặt cọc
                    project.setPaymentStatus(Project.PaymentStatus.DEPOSIT_PAID);
                    // Chuyển trạng thái dự án sang APPROVED
                    ProjectStatus approvedStatus = getProjectStatusByName("APPROVED");
                    project.setStatus(approvedStatus);
                    updateProjectFieldsBasedOnStatus(project, approvedStatus);
                    log.info("Deposit payment successful for project: {}. Status updated to APPROVED", projectId);
                } else if (project.getPaymentStatus() == Project.PaymentStatus.DEPOSIT_PAID) {
                    // Nếu là thanh toán đầy đ và đã TECHNICALLY_COMPLETED
                    if (!"TECHNICALLY_COMPLETED".equals(project.getStatus().getName())) {
                        throw new IllegalStateException("Project must be technically completed before final payment");
                    }
                    project.setPaymentStatus(Project.PaymentStatus.FULLY_PAID);
                    log.info("Full payment successful for project: {}, waiting for manager approval", projectId);
                }
            } else {
                log.warn("Payment failed for project: {}. VNPay response code: {}", projectId, vnp_ResponseCode);
            }

            project.setUpdatedAt(LocalDateTime.now());
            projectRepository.save(project);
        }
    }

    @PreAuthorize("hasAuthority('ROLE_4')")
    @Transactional
    public ProjectDTO markProjectAsTechnicallyCompleted(String projectId, String constructorUsername) {
        synchronized (projectId.intern()) {
            Project project = getProjectById(projectId);

            // 1. Validate trạng thái dự án
            if (!"IN_PROGRESS".equals(project.getStatus().getName())) {
                log.warn("Invalid project status for technical completion. Current status: {}", 
                    project.getStatus().getName());
                throw new IllegalStateException("Project must be IN_PROGRESS to be marked as technically completed");
            }

            // 2. Validate constructor role và assignment
            User constructor = getUserByUsername(constructorUsername);
            if (!constructor.getRoleId().equals("4")) {
                log.warn("User {} is not a constructor (ROLE_4)", constructorUsername);
                throw new AccessDeniedException("Only construction staff can mark projects as technically completed");
            }

            // 3. Validate constructor được phân công
            if (project.getConstructor() == null || !project.getConstructor().getId().equals(constructor.getId())) {
                log.warn("Constructor {} is not assigned to project {}", constructorUsername, projectId);
                throw new AccessDeniedException("Only the assigned constructor can mark the project as technically completed");
            }

            // 4. Validate constructor đang active
            if (!constructor.isHasActiveProject()) {
                log.warn("Constructor {} is not active on project {}", constructorUsername, projectId);
                throw new IllegalStateException("Constructor is not active on this project");
            }

            // 5. Validate tất cả tasks hoàn thành
            if (!taskService.areAllTasksCompleted(projectId)) {
                log.warn("Not all tasks are completed for project {}", projectId);
                throw new IllegalStateException("Cannot mark project as technically completed. Not all tasks are completed.");
            }

            // 6. Cập nhật trạng thái
            ProjectStatus technicallyCompletedStatus = getProjectStatusByName("TECHNICALLY_COMPLETED");
            project.setStatus(technicallyCompletedStatus);
            project.setTechnicalCompletionDate(LocalDate.now());
            project.setProgressPercentage(100);
            project.setCompletedStages(project.getTotalStages() - 1);
            project.setUpdatedAt(LocalDateTime.now());

            Project updatedProject = projectRepository.save(project);
            log.info("Project {} marked as technically completed by constructor {}", 
                projectId, constructorUsername);
            return convertToDTO(updatedProject);
        }
    }

    @Transactional
    public ProjectDTO updatePaymentStatus(String projectId, Project.PaymentStatus newStatus, String consultantUsername) {
        synchronized (projectId.intern()) {
            Project project = getProjectById(projectId);
            
            // Store current states
            Project.PaymentStatus currentPaymentStatus = project.getPaymentStatus();
            String currentProjectStatus = project.getStatus().getName();
            
            // Validate state transition
            validatePaymentStatusTransition(currentPaymentStatus, newStatus, currentProjectStatus);
            
            project.setPaymentStatus(newStatus);
            project.setUpdatedAt(LocalDateTime.now());

            // Thêm logic để tự động cập nhật trạng thái dự án
            if (newStatus == Project.PaymentStatus.DEPOSIT_PAID && "PENDING".equals(currentProjectStatus)) {
                ProjectStatus approvedStatus = getProjectStatusByName("APPROVED");
                project.setStatus(approvedStatus);
                updateProjectFieldsBasedOnStatus(project, approvedStatus);
                log.info("Project status automatically updated to APPROVED after deposit payment");
            }

            Project updatedProject = projectRepository.save(project);
            log.info("Payment status updated to {} for project {}", newStatus, projectId);
            return convertToDTO(updatedProject);
        }
    }

    private void validatePaymentStatusTransition(
        Project.PaymentStatus currentStatus, 
        Project.PaymentStatus newStatus, 
        String projectStatus) {
        
        switch (currentStatus) {
            case UNPAID:
                if (newStatus != Project.PaymentStatus.DEPOSIT_PAID) {
                    throw new IllegalStateException("From UNPAID, can only change to DEPOSIT_PAID");
                }
                break;
            case DEPOSIT_PAID:
                if (newStatus != Project.PaymentStatus.FULLY_PAID) {
                    throw new IllegalStateException("From DEPOSIT_PAID, can only change to FULLY_PAID");
                }
                if (!"TECHNICALLY_COMPLETED".equals(projectStatus)) {
                    throw new IllegalStateException("Project must be technically completed before marking as fully paid");
                }
                break;
            case FULLY_PAID:
                throw new IllegalStateException("Cannot change payment status once fully paid");
        }
    }

    // Thêm method để cập nhật trạng thái active của constructor
    private void updateConstructorActiveStatus(Project project) {
        if (project.getConstructor() != null) {
            User constructor = project.getConstructor();
            boolean hasActiveProject = project.getStatus().getName() != null && 
                !Arrays.asList("COMPLETED", "CANCELLED").contains(project.getStatus().getName());
            constructor.setHasActiveProject(hasActiveProject);
            userRepository.save(constructor);
        }
    }

    @Transactional
    public ProjectDTO createProjectFromDesign(String designId, String consultantUsername) {
        // Lấy thông tin design
        Design design = designRepository.findById(designId)
            .orElseThrow(() -> new ResourceNotFoundException("Design not found"));

        // Kiểm tra trạng thái design
        if (design.getStatus() != Design.DesignStatus.APPROVED) {
            throw new IllegalStateException("Can only create project from approved design");
        }

        // Lấy thông tin design request và consultation
        DesignRequest designRequest = designRequestRepository.findByDesignId(designId)
            .orElseThrow(() -> new ResourceNotFoundException("Design request not found"));
        
        ConsultationRequest consultation = designRequest.getConsultation();
        
        // Validate consultant
        if (!consultation.getConsultant().getUsername().equals(consultantUsername)) {
            throw new AccessDeniedException("Only assigned consultant can create project");
        }

        // Tạo project mới
        Project project = new Project();

        // Lấy thông tin từ consultation entity
        ConsultationRequest consultationEntity = designRequest.getConsultation();
        User customer = consultationEntity.getCustomer();
        User consultant = consultationEntity.getConsultant();

        project.setName("Project for " + customer.getFullName());
        project.setDescription("Created from approved design: " + design.getName());
        project.setCustomer(customer);
        project.setConsultant(consultant);
        project.setDesign(design);
        project.setTotalPrice(design.getBasePrice());
        project.setDepositAmount(calculateDepositAmount(design.getBasePrice()));
        project.setAddress(consultation.getRequirements());
        
        // Set các trạng thái mặc định
        ProjectStatus pendingStatus = getProjectStatusByName("PENDING");
        project.setStatus(pendingStatus);
        project.setPaymentStatus(Project.PaymentStatus.UNPAID);
        project.setProgressPercentage(0);
        project.setActive(true);

        // Lưu project
        Project savedProject = projectRepository.save(project);
        
        // Tạo các task mặc định
        createTasksForProject(savedProject.getId());

        log.info("Created new project {} from design {}", savedProject.getId(), designId);
        return convertToDTO(savedProject);
    }

    private BigDecimal calculateDepositAmount(BigDecimal totalPrice) {
        return totalPrice.multiply(new BigDecimal("0.5")); // 50% đặt cọc
    }
}
