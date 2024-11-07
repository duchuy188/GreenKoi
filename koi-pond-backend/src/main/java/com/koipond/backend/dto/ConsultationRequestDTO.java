package com.koipond.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;

@Data
public class ConsultationRequestDTO {
    private String id;
    private String status;
    private String customerId;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String consultantId;
    private String consultantName;
    private String consultationNotes;
    private String designId;
    private String designName;
    private String designDescription;
    private boolean customDesign;
    private String requirements;
    private String preferredStyle;
    private String dimensions;
    private String referenceImages;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal budget;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal estimatedCost;
    private String notes;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime consultationDate;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
