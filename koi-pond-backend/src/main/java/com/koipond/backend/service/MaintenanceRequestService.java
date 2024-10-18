package com.koipond.backend.service;

import com.koipond.backend.dto.MaintenanceRequestDTO;
import com.koipond.backend.model.MaintenanceRequest;
import com.koipond.backend.repository.MaintenanceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;

    @Autowired
    public MaintenanceRequestService(MaintenanceRequestRepository maintenanceRequestRepository) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    public MaintenanceRequestDTO createMaintenanceRequest(MaintenanceRequestDTO dto) {
        MaintenanceRequest request = convertToEntity(dto);
        request = maintenanceRequestRepository.save(request);
        return convertToDTO(request);
    }

    public List<MaintenanceRequestDTO> getMaintenanceRequestsByCustomer(String customerId) {
        return maintenanceRequestRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Add more methods as needed

    private MaintenanceRequest convertToEntity(MaintenanceRequestDTO dto) {
        MaintenanceRequest entity = new MaintenanceRequest();
        entity.setId(dto.getId());
        entity.setDescription(dto.getDescription());
        entity.setAttachments(dto.getAttachments());
        entity.setRequestStatus(dto.getRequestStatus());
        entity.setMaintenanceStatus(dto.getMaintenanceStatus());
        entity.setAgreedPrice(dto.getAgreedPrice());
        entity.setScheduledDate(dto.getScheduledDate());
        entity.setStartDate(dto.getStartDate());
        entity.setCompletionDate(dto.getCompletionDate());
        entity.setCancellationReason(dto.getCancellationReason());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
        return entity;
    }

    private MaintenanceRequestDTO convertToDTO(MaintenanceRequest entity) {
        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        dto.setId(entity.getId());
        dto.setDescription(entity.getDescription());
        dto.setAttachments(entity.getAttachments());
        dto.setRequestStatus(entity.getRequestStatus());
        dto.setMaintenanceStatus(entity.getMaintenanceStatus());
        dto.setAgreedPrice(entity.getAgreedPrice());
        dto.setScheduledDate(entity.getScheduledDate());
        dto.setStartDate(entity.getStartDate());
        dto.setCompletionDate(entity.getCompletionDate());
        dto.setCancellationReason(entity.getCancellationReason());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
