package com.koipond.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewDTO {
    private String id;
    private String maintenanceRequestId;
    private String projectId;
    private String customerId;
    private int rating;
    private String comment;
    private LocalDateTime reviewDate;
    private String status;
}
