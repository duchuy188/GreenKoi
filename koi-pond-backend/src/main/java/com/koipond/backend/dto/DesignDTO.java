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
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
