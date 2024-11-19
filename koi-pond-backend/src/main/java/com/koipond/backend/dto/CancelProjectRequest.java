package com.koipond.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class CancelProjectRequest {
    @NotBlank(message = "Reason cannot be blank")
    private String reason;


    private String requestedById;
}