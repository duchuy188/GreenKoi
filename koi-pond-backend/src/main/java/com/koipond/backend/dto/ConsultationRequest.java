package com.koipond.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationRequest {
    private String id;
    private String customerId;
    private String designId;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String designName;
    private String designDescription;
}
