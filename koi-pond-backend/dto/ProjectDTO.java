package com.koipond.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProjectDTO {
    private String id;
    private String name;
    private String description;
    private String statusId;
    private String statusName;
    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String customerId;
    private String consultantId;
    private String designId;
    private String promotionId;
    private BigDecimal discountedPrice;
    private String address;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}