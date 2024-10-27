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
import com.koipond.backend.model.Task;
import com.koipond.backend.model.TaskTemplate;
import com.koipond.backend.repository.TaskRepository;
import com.koipond.backend.repository.TaskTemplateRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class ProjectService {
    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;
    private final PromotionRepository promotionRepository;
    private final ProjectStatusRepository projectStatusRepository;
    private final ProjectCancellationRepository projectCancellationRepository;
    private final TaskRepository taskRepository;
    private final TaskTemplateRepository taskTemplateRepository;
    private final TaskService taskService;
    private final ReviewRepository reviewRepository;
    private final VNPayService vnPayService;

    @Autowired
    public ProjectService(ProjectRepository projectRepository,
                         UserRepository userRepository,
                         DesignRepository designRepository,
                         PromotionRepository promotionRepository,
                         ProjectStatusRepository projectStatusRepository,
                         ProjectCancellationRepository projectCancellationRepository,
                         TaskRepository taskRepository,
                         TaskTemplateRepository taskTemplateRepository,
                         TaskService taskService,
                         ReviewRepository reviewRepository,
                         VNPayService vnPayService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
        this.promotionRepository = promotionRepository;
        this.projectStatusRepository = projectStatusRepository;
        this.projectCancellationRepository = projectCancellationRepository;
        this.taskRepository = taskRepository;
        this.taskTemplateRepository = taskTemplateRepository;
        this.taskService = taskService;
        this.reviewRepository = reviewRepository;
        this.vnPayService = vnPayService;
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
        log.info("Updating status of project with id: {} to {}. User: {}", id, newStatus, username);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        User user = getUserByUsername(username);
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

        Project updatedProject = projectRepository.save(project);
        log.info("Project status updated successfully: {}", updatedProject.getId());
        return convertToDTO(updatedProject);
    }

    @Transactional
    public ProjectDTO cancelProject(String id, CancelProjectRequest request, String username) {
        log.info("Cancelling project with id: {}. User: {}", id, username);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        User user = getUserByUsername(username);
        boolean isManager = user.getRoleId().equals("1");
        
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
            case "PENDING" -> newStatus.getName().equals("CANCELLED");
            case "APPROVED" -> newStatus.getName().equals("IN_PROGRESS");
            case "IN_PROGRESS" -> newStatus.getName().equals("ON_HOLD") || 
                                newStatus.getName().equals("TECHNICALLY_COMPLETED") || 
                                newStatus.getName().equals("MAINTENANCE");
            case "TECHNICALLY_COMPLETED" -> newStatus.getName().equals("COMPLETED");
            case "ON_HOLD" -> newStatus.getName().equals("IN_PROGRESS");
            case "MAINTENANCE" -> newStatus.getName().equals("IN_PROGRESS");
            case "COMPLETED" -> false;
            case "CANCELLED" -> false;
            default -> false;
        };
    }

    private void updateProjectFieldsBasedOnStatus(Project project, ProjectStatus newStatus) {
        switch (newStatus.getName()) {
            case "APPROVED":
                project.setApprovalDate(LocalDate.now());
                project.setCompletedStages(1);  // Đã hoàn thành stage đầu tiên
                break;
            
            case "IN_PROGRESS":
                if (project.getStartDate() == null) {
                    project.setStartDate(LocalDate.now());
                }
                project.setCompletedStages(2);  // Đã hoàn thành stage thứ 2
                break;
            
            case "TECHNICALLY_COMPLETED":
                project.setTechnicalCompletionDate(LocalDate.now());
                project.setProgressPercentage(100);
                project.setCompletedStages(project.getTotalStages() - 1);  // Hoàn thành tất cả trừ stage cuối
                break;
            
            case "COMPLETED":
                project.setCompletionDate(LocalDate.now());
                project.setCompletedStages(project.getTotalStages());  // Hoàn thành tất cả stages
                if (project.getConstructor() != null) {
                    User constructor = project.getConstructor();
                    constructor.setHasActiveProject(false);
                    userRepository.save(constructor);
                }
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
        
        // Kiểm tra constructor có đang bận không - Sửa lại kiểu boolean
        if (constructor.isHasActiveProject()) {  // Thay vì dùng getHasActiveProject()
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
        log.info("Attempting to complete project with id: {}. Manager: {}", projectId, managerUsername);
        Project project = getProjectById(projectId);
        
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
        
        ProjectStatus completedStatus = getProjectStatusByName("COMPLETED");
        project.setStatus(completedStatus);
        project.setCompletionDate(LocalDate.now());
        project.setUpdatedAt(LocalDateTime.now());
        
        // Giải phóng constructor
        User constructor = project.getConstructor();
        if (constructor != null) {
            constructor.setHasActiveProject(false);
            userRepository.save(constructor);
        }
        
        Project updatedProject = projectRepository.save(project);
        log.info("Project completed successfully: {}", updatedProject.getId());
        return convertToDTO(updatedProject);
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
        dto.setNotes(task.getNotes());  // Thêm dòng này nếu bạn muốn bao gồm notes
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

   
    public List<ProjectDTO> getCompletedProjectsByCustomer(String customerId) {
        log.info("Fetching completed projects for customer: {}", customerId);
        return projectRepository.findByCustomerIdAndStatus_Name(customerId, "COMPLETED").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

  
    public boolean isProjectCompletedAndOwnedByCustomer(String projectId, String customerId) {
        log.info("Checking if project {} is completed and owned by customer {}", projectId, customerId);
        return projectRepository.existsByIdAndCustomerIdAndStatus_Name(projectId, customerId, "COMPLETED");
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

        if (project.getPaymentStatus() == Project.PaymentStatus.UNPAID) {
            // Nếu chưa thanh toán, lấy số tiền đặt cọc
            amount = project.getDepositAmount().longValue();
        } else if (project.getPaymentStatus() == Project.PaymentStatus.DEPOSIT_PAID 
                   && "TECHNICALLY_COMPLETED".equals(project.getStatus().getName())) {
            // Nếu đã đặt cọc và hoàn thành kỹ thuật, lấy số tiền còn lại
            amount = project.getRemainingAmount().longValue();
        } else {
            throw new IllegalStateException("Invalid payment state");
        }

        String paymentUrl = vnPayService.createPaymentUrl(projectId, amount, request);
        return paymentUrl;
    }

    @Transactional
    public void processPaymentResult(String projectId, String vnp_ResponseCode) {
        log.info("Processing payment result for project: {}, response code: {}", projectId, vnp_ResponseCode);
        Project project = getProjectById(projectId);
        
        if ("00".equals(vnp_ResponseCode)) {
            if (Project.PaymentStatus.DEPOSIT_PAID.equals(project.getPaymentStatus())) {
                project.setPaymentStatus(Project.PaymentStatus.FULLY_PAID);
                // Bỏ phần tự động chuyển sang COMPLETED
                log.info("Full payment successful for project: {}", projectId);
            }
        } else {
            log.warn("Payment failed for project: {}. VNPay response code: {}", projectId, vnp_ResponseCode);
        }
        
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);
    }

    @Transactional
    public ProjectDTO markProjectAsTechnicallyCompleted(String projectId, String constructorUsername) {
        log.info("Marking project as technically completed: {}. Constructor: {}", projectId, constructorUsername);
        Project project = getProjectById(projectId);
        
        User constructor = getUserByUsername(constructorUsername);
        if (!constructor.getId().equals(project.getConstructor().getId())) {
            throw new AccessDeniedException("Only the assigned constructor can mark the project as technically completed");
        }
        
        if (!taskService.areAllTasksCompleted(projectId)) {
            throw new IllegalStateException("Cannot mark project as technically completed. Not all tasks are completed.");
        }
        
        ProjectStatus technicallyCompletedStatus = getProjectStatusByName("TECHNICALLY_COMPLETED");
        project.setStatus(technicallyCompletedStatus);
        project.setTechnicalCompletionDate(LocalDate.now());
        project.setProgressPercentage(100);
        project.setCompletedStages(project.getTotalStages() - 1);  // Hoàn thành tất cả trừ stage cuối
        project.setUpdatedAt(LocalDateTime.now());
        
        Project updatedProject = projectRepository.save(project);
        return convertToDTO(updatedProject);
    }

    @Transactional
    public ProjectDTO updatePaymentStatus(String projectId, Project.PaymentStatus newStatus, String consultantUsername) {
        log.info("Updating payment status for project: {} to {}. Consultant: {}", projectId, newStatus, consultantUsername);
        Project project = getProjectById(projectId);
        
        // Kiểm tra quyền
        if (!project.getConsultant().getUsername().equals(consultantUsername)) {
            throw new AccessDeniedException("Only assigned consultant can update payment status");
        }
        
        // Kiểm tra logic chuyển trạng thái
        switch (project.getPaymentStatus()) {
            case UNPAID:
                if (newStatus != Project.PaymentStatus.DEPOSIT_PAID) {
                    throw new IllegalStateException("From UNPAID, can only change to DEPOSIT_PAID");
                }
                // Khi đặt cọc thành công, chuyển trạng thái sang APPROVED
                ProjectStatus approvedStatus = getProjectStatusByName("APPROVED");
                project.setStatus(approvedStatus);
                break;
                
            case DEPOSIT_PAID:
                if (newStatus != Project.PaymentStatus.FULLY_PAID) {
                    throw new IllegalStateException("From DEPOSIT_PAID, can only change to FULLY_PAID");
                }
                if (!"TECHNICALLY_COMPLETED".equals(project.getStatus().getName())) {
                    throw new IllegalStateException("Project must be technically completed before marking as fully paid");
                }
                break;
                
            case FULLY_PAID:
                throw new IllegalStateException("Cannot change payment status once fully paid");
        }
        
        project.setPaymentStatus(newStatus);
        project.setUpdatedAt(LocalDateTime.now());
        
        Project updatedProject = projectRepository.save(project);
        log.info("Payment status updated to {} for project {}", newStatus, projectId);
        return convertToDTO(updatedProject);
    }
}
