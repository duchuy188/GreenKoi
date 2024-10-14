package com.koipond.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskDTO {
    private String id;
    private String projectId;
    private String name;
    private String description;
    private String status;
    private Integer orderIndex;
    private Integer completionPercentage;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}