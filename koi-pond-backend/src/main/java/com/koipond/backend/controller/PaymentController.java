package com.koipond.backend.controller;

import com.koipond.backend.dto.PaymentUrlResponse;
import com.koipond.backend.dto.ErrorResponse;
import com.koipond.backend.service.ProjectService;
import com.koipond.backend.service.MaintenanceRequestService;
import com.koipond.backend.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment Management", description = "APIs for managing payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final ProjectService projectService;
    private final MaintenanceRequestService maintenanceRequestService;

    @Autowired
    public PaymentController(ProjectService projectService, 
                           MaintenanceRequestService maintenanceRequestService) {
        this.projectService = projectService;
        this.maintenanceRequestService = maintenanceRequestService;
    }

    @PostMapping("/create-payment/{projectId}")
    @PreAuthorize("hasAuthority('ROLE_5')")
    @Operation(summary = "Create payment URL", description = "Creates a payment URL for the specified project using VNPay.")
    @ApiResponse(responseCode = "200", description = "Payment URL created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid project state for payment")
    @ApiResponse(responseCode = "404", description = "Project not found")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    public ResponseEntity<?> createPayment(@PathVariable String projectId, HttpServletRequest request) {
        logger.info("Creating payment URL for project: {}", projectId);
        try {
            String paymentUrl = projectService.createPaymentUrl(projectId, request);
            return ResponseEntity.ok(new PaymentUrlResponse(paymentUrl));
        } catch (ResourceNotFoundException e) {
            logger.error("Project not found: {}", projectId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Project not found: " + e.getMessage()));
        } catch (IllegalStateException e) {
            logger.warn("Invalid state for creating payment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error occurred while creating payment URL for project {}", projectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("An unexpected error occurred"));
        }
    }

    @PostMapping("/verify-payment")
    @Operation(summary = "Verify VNPay payment", description = "Verifies the payment result from VNPay.")
    @ApiResponse(responseCode = "200", description = "Payment verified successfully")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> queryParams) {
        String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
        String vnp_TxnRef = queryParams.get("vnp_TxnRef");
        String vnp_OrderInfo = queryParams.get("vnp_OrderInfo");

        String id = vnp_TxnRef.split("_")[0];

        logger.info("Verifying VNPay payment - ID: {}, OrderInfo: {}, ResponseCode: {}", 
            id, vnp_OrderInfo, vnp_ResponseCode);

        try {
            if (vnp_OrderInfo.contains("project")) {
                projectService.processPaymentResult(id, vnp_ResponseCode);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Project payment verified successfully",
                    "paymentType", "PROJECT"
                ));
            } else if (vnp_OrderInfo.contains("bao tri")) {
                String paymentType = vnp_OrderInfo.contains("dat coc") ? 
                    "MAINTENANCE_DEPOSIT" : "MAINTENANCE_FINAL";
                    
                maintenanceRequestService.processVnPayCallback(id, vnp_ResponseCode, paymentType);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Maintenance payment verified successfully",
                    "paymentType", "MAINTENANCE"
                ));
            } else {
                throw new IllegalArgumentException("Invalid payment type in OrderInfo");
            }
        } catch (Exception e) {
            logger.error("Error verifying payment for ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error verifying payment: " + e.getMessage()));
        }
    }
}
