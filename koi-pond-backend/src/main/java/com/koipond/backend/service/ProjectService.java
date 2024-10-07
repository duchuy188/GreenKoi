package com.koipond.backend.service;

import com.koipond.backend.dto.CreateProjectRequest;
import com.koipond.backend.dto.ProjectDTO;
import com.koipond.backend.model.Project;
import com.koipond.backend.model.ProjectStatus;
import com.koipond.backend.model.User;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.Promotion;
import com.koipond.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.koipond.backend.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;
    private final PromotionRepository promotionRepository;
    private final ProjectStatusRepository projectStatusRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository,
                          UserRepository userRepository,
                          DesignRepository designRepository,
                          PromotionRepository promotionRepository,
                          ProjectStatusRepository projectStatusRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
        this.promotionRepository = promotionRepository;
        this.projectStatusRepository = projectStatusRepository;
    }

    public List<ProjectDTO> getAllProjects() {
        log.info("Fetching all projects");
        return projectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request) {
        log.info("Creating new project with request: {}", request);
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCustomer(getUserById(request.getCustomerId()));
        project.setConsultant(getUserById(request.getConsultantId()));
        project.setDesign(getDesignById(request.getDesignId()));
        project.setPromotion(getPromotionById(request.getPromotionId()));
        project.setTotalPrice(request.getTotalPrice());
        project.setDepositAmount(request.getDepositAmount());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setAddress(request.getAddress());

        ProjectStatus pendingStatus = getProjectStatusByName("PENDING");
        if (pendingStatus == null) {
            log.error("Failed to find 'PENDING' status. Available statuses: {}", 
                projectStatusRepository.findAll().stream().map(ProjectStatus::getName).collect(Collectors.toList()));
            throw new ResourceNotFoundException("Required 'PENDING' project status not found in the database");
        }
        project.setStatus(pendingStatus);
        log.info("Set project status to: {}", pendingStatus.getName());

        // Các trường mặc định
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
}