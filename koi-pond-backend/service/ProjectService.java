package com.koipond.backend.service;

import com.koipond.backend.dto.ProjectDTO;
import com.koipond.backend.model.Project;
import com.koipond.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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