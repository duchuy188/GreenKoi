package com.koipond.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;


@Data
public class DesignRequestDTO {
    private String id;
    private String status;
    
    // Thông tin từ ConsultationRequest
    private String consultationId;
    private String customerId;
    private String customerName;
    private String requirements;
    private String preferredStyle;
    private String dimensions;
    private BigDecimal budget;
    
    // Thông tin Designer
    private String designerId;
    private String designerName;
    
    // Thông tin Design
    private String designId;
    private String designName;
    private String designDescription;
    private String designNotes;
    private BigDecimal estimatedCost;
    
    // Thông tin Review
    private LocalDateTime reviewDate;
    private String reviewerId;
    private String reviewerName;
    private String reviewNotes;
    private int revisionCount;
    private String rejectionReason;
    
    // Tracking thời gian
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
