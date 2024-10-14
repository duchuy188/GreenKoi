package com.koipond.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private String customerId;
    private String consultantId;
    private String designId;
    private String promotionId;
    private BigDecimal discountedPrice;
    private String address;
    private boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    private String constructorId;  // Thêm trường này
}
