package com.koipond.backend.dto;

import lombok.Data;

@Data
public class UpdateProjectStatusRequest {
    private String newStatus;
}