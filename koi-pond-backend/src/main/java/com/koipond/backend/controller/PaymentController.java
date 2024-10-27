package com.koipond.backend.controller;

import com.koipond.backend.dto.PaymentUrlResponse;
import com.koipond.backend.dto.ErrorResponse;
import com.koipond.backend.service.ProjectService;
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

    @Autowired
    public PaymentController(ProjectService projectService) {
        this.projectService = projectService;
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

    @GetMapping("/vnpay-return")
    @Operation(summary = "Process VNPay return", description = "Processes the payment result returned by VNPay.")
    @ApiResponse(responseCode = "200", description = "Payment processed successfully")
    @ApiResponse(responseCode = "500", description = "Error processing payment")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> queryParams) {
        String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
        String vnp_TxnRef = queryParams.get("vnp_TxnRef");
        
        // Tách lấy projectId từ vnp_TxnRef (bỏ phần timestamp)
        String projectId = vnp_TxnRef.split("_")[0];
        
        logger.info("Processing VNPay return for project: {}, response code: {}", projectId, vnp_ResponseCode);
        try {
            projectService.processPaymentResult(projectId, vnp_ResponseCode);
            return ResponseEntity.ok("Payment processed successfully");
        } catch (ResourceNotFoundException e) {
            logger.error("Project not found: {}", projectId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Project not found: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error processing payment for project: {}", projectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error processing payment: " + e.getMessage()));
        }
    }
}
