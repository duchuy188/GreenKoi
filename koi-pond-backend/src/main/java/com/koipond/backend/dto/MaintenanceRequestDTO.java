package com.koipond.backend.dto;

import com.koipond.backend.model.MaintenanceRequest;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MaintenanceRequestDTO {
    private String id;
    private String customerId;
    private String projectId;
    private String consultantId;
    private String description;
    private String attachments;
    private MaintenanceRequest.RequestStatus requestStatus;
    private MaintenanceRequest.MaintenanceStatus maintenanceStatus;
    private BigDecimal agreedPrice;
    private LocalDate scheduledDate;
    private LocalDate startDate;
    private LocalDate completionDate;
    private String assignedTo;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String maintenanceNotes;
    private List<String> maintenanceImages;
}
