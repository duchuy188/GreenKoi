package com.koipond.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String designId;
    private String promotionId;
    private String address;
    private String customerId;
    private String consultantId;
}