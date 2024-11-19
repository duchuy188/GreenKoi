package com.koipond.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DesignDTO {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal basePrice;
    private String shape;
    private String dimensions;
    private String features;
    private String createdById;
    private String createdByName;
    private String status;
    private String rejectionReason;
    private boolean isActive;
    private boolean isPublic;
    private boolean isCustom;
    private Boolean customerApprovedPublic;
    private String referenceDesignId;
    private String referenceDesignName;
    private String referenceDesignDescription;
    private String designRequestId;
    private String projectId;
    private LocalDateTime customerApprovalDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
