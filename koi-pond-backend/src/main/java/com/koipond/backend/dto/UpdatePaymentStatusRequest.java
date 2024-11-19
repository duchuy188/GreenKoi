package com.koipond.backend.dto;

import lombok.Data;
import com.koipond.backend.model.Project;
import jakarta.validation.constraints.NotNull;

@Data
public class UpdatePaymentStatusRequest {
    @NotNull(message = "Payment status is required")
    private Project.PaymentStatus paymentStatus;
}
