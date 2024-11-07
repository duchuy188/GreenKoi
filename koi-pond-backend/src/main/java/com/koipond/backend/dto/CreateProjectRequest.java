package com.koipond.backend.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private BigDecimal totalPrice;
    private BigDecimal depositAmount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private String designId;
    private String designRequestId;
    private String promotionId;
    private String address;
    private String customerId;
    private String consultantId;
}