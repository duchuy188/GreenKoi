package com.koipond.backend.controller;

import com.koipond.backend.dto.MaintenanceRequestDTO;
import com.koipond.backend.dto.ReviewDTO;
import com.koipond.backend.service.MaintenanceRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import com.koipond.backend.security.CustomUserDetailsService.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/maintenance-requests")
@Tag(name = "Maintenance Request Controller", description = "API endpoints for managing maintenance requests")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    public MaintenanceRequestController(MaintenanceRequestService maintenanceRequestService) {
        this.maintenanceRequestService = maintenanceRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_5')")
    @Operation(summary = "Create a new maintenance request", description = "Creates a new maintenance request. Only accessible by customers.")
    public ResponseEntity<MaintenanceRequestDTO> createMaintenanceRequest(@RequestBody MaintenanceRequestDTO request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String customerId = userDetails.getId();
        MaintenanceRequestDTO createdRequest = maintenanceRequestService.createMaintenanceRequest(request, customerId);
        return ResponseEntity.ok(createdRequest);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ROLE_5')")
    @Operation(summary = "Get customer's maintenance requests", description = "Retrieves all maintenance requests for a specific customer. Only accessible by the customer.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getCustomerMaintenanceRequests(@PathVariable String customerId) {
        List<MaintenanceRequestDTO> requests = maintenanceRequestService.getMaintenanceRequestsByCustomer(customerId);
        return ResponseEntity.ok(requests);
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('ROLE_2')")
    @Operation(summary = "Start reviewing a maintenance request", description = "Consultant starts reviewing a maintenance request. Only accessible by consultants.")
    public ResponseEntity<MaintenanceRequestDTO> startReviewingRequest(@PathVariable String id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String consultantId = userDetails.getId();
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.startReviewingRequest(id, consultantId);
        return ResponseEntity.ok(updatedRequest);
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ROLE_2')")
    @Operation(summary = "Confirm maintenance request", description = "Consultant confirms the maintenance request with agreed price. Only accessible by consultants.")
    public ResponseEntity<MaintenanceRequestDTO> confirmMaintenanceRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String agreedPriceStr = body.get("agreedPrice");
        BigDecimal agreedPrice = new BigDecimal(agreedPriceStr);
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.confirmMaintenanceRequest(id, agreedPrice);
        return ResponseEntity.ok(updatedRequest);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ROLE_1')")
    @Operation(summary = "Assign maintenance staff", description = "Manager assigns maintenance staff to a confirmed request. Only accessible by managers.")
    public ResponseEntity<MaintenanceRequestDTO> assignMaintenanceStaff(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String staffId = body.get("staffId");
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.assignMaintenanceStaff(id, staffId);
        return ResponseEntity.ok(updatedRequest);
    }

    @PatchMapping("/{id}/schedule")
    @PreAuthorize("hasRole('ROLE_4')")
    @Operation(summary = "Schedule maintenance", description = "Schedule the maintenance. Only accessible by construction staff.")
    public ResponseEntity<MaintenanceRequestDTO> scheduleMaintenance(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String scheduledDate = body.get("scheduledDate");
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.scheduleMaintenance(id, scheduledDate);
        return ResponseEntity.ok(updatedRequest);
    }

    @PatchMapping("/{id}/start-maintenance")
    @PreAuthorize("hasRole('ROLE_4')")
    @Operation(summary = "Start maintenance", description = "Start the maintenance process. Only accessible by maintenance staff.")
    public ResponseEntity<MaintenanceRequestDTO> startMaintenance(@PathVariable String id) {
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.startMaintenance(id);
        return ResponseEntity.ok(updatedRequest);
    }

    @PatchMapping("/{id}/complete-maintenance")
    @PreAuthorize("hasRole('ROLE_4')")
    @Operation(summary = "Complete maintenance", description = "Mark the maintenance as completed with notes and images. Only accessible by maintenance staff.")
    public ResponseEntity<MaintenanceRequestDTO> completeMaintenance(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        String maintenanceNotes = (String) body.get("maintenanceNotes");
        @SuppressWarnings("unchecked")
        List<String> maintenanceImages = (List<String>) body.get("maintenanceImages");
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.completeMaintenance(id, maintenanceNotes, maintenanceImages);
        return ResponseEntity.ok(updatedRequest);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ROLE_2')")
    @Operation(summary = "Get pending maintenance requests", description = "Retrieves all pending maintenance requests. Only accessible by consultants.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getPendingMaintenanceRequests() {
        List<MaintenanceRequestDTO> pendingRequests = maintenanceRequestService.getPendingMaintenanceRequests();
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/confirmed")
    @PreAuthorize("hasAnyRole('ROLE_1', 'ROLE_2')") 
    @Operation(summary = "Get confirmed maintenance requests", 
              description = "Retrieves all confirmed maintenance requests. Accessible by managers and consultants.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getConfirmedMaintenanceRequests() {
        List<MaintenanceRequestDTO> confirmedRequests = maintenanceRequestService.getConfirmedMaintenanceRequests();
        return ResponseEntity.ok(confirmedRequests);
    }

    @GetMapping("/assigned-to-me")
    @PreAuthorize("hasRole('ROLE_4')")
    @Operation(summary = "Get assigned maintenance requests", description = "Retrieves all maintenance requests assigned to the current maintenance staff. Only accessible by maintenance staff.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getAssignedMaintenanceRequests(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String staffId = userDetails.getId();
        List<MaintenanceRequestDTO> assignedRequests = maintenanceRequestService.getAssignedMaintenanceRequests(staffId);
        return ResponseEntity.ok(assignedRequests);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ROLE_1', 'ROLE_2', 'ROLE_5')") // Allow Manager, Consultant, and Customer
    @Operation(summary = "Cancel maintenance request", description = "Cancel a maintenance request with a reason. Accessible by managers, consultants, and customers.")
    public ResponseEntity<MaintenanceRequestDTO> cancelMaintenanceRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = userDetails.getId();
        String userRole = userDetails.getAuthorities().iterator().next().getAuthority();
        String cancellationReason = body.get("cancellationReason");
        MaintenanceRequestDTO cancelledRequest = maintenanceRequestService.cancelMaintenanceRequest(id, userId, userRole, cancellationReason);
        return ResponseEntity.ok(cancelledRequest);
    }

    @GetMapping("/cancelled")
    @PreAuthorize("hasAnyRole('ROLE_1', 'ROLE_2', 'ROLE_5')") // Allow Manager, Consultant, and Customer
    @Operation(summary = "Get cancelled maintenance requests", description = "Retrieves all cancelled maintenance requests. Accessible by managers, consultants, and customers.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getCancelledMaintenanceRequests() {
        List<MaintenanceRequestDTO> cancelledRequests = maintenanceRequestService.getCancelledMaintenanceRequests();
        return ResponseEntity.ok(cancelledRequests);
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('ROLE_5')")
    @Operation(summary = "Create a review for a maintenance request", description = "Creates a new review for a completed maintenance request. Only accessible by customers.")
    public ResponseEntity<ReviewDTO> createReview(
            @PathVariable String id,
            @RequestBody ReviewDTO reviewDTO,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String customerId = userDetails.getId();
        ReviewDTO createdReview = maintenanceRequestService.createReview(id, reviewDTO, customerId);
        return ResponseEntity.ok(createdReview);
    }

    @GetMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ROLE_1', 'ROLE_2', 'ROLE_4', 'ROLE_5')")
    @Operation(summary = "Get review for a maintenance request", description = "Retrieves the review for a specific maintenance request. Accessible by managers, consultants, maintenance staff, and customers.")
    public ResponseEntity<ReviewDTO> getReviewForMaintenanceRequest(@PathVariable String id) {
        ReviewDTO review = maintenanceRequestService.getReviewForMaintenanceRequest(id);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/reviewing")
    @PreAuthorize("hasRole('ROLE_2')")
    @Operation(summary = "Get reviewing maintenance requests", description = "Retrieves all maintenance requests in reviewing status. Only accessible by consultants.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getReviewingMaintenanceRequests() {
        List<MaintenanceRequestDTO> reviewingRequests = maintenanceRequestService.getReviewingMaintenanceRequests();
        return ResponseEntity.ok(reviewingRequests);
    }

    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('ROLE_1', 'ROLE_4')") // Allow Manager and Construction Staff
    @Operation(summary = "Get completed maintenance requests", description = "Retrieves all completed maintenance requests. Accessible by managers and construction staff.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getCompletedMaintenanceRequests(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        List<MaintenanceRequestDTO> completedRequests;
        if ("ROLE_1".equals(role)) {
            // Manager: Get all completed requests
            completedRequests = maintenanceRequestService.getAllCompletedMaintenanceRequests();
        } else {
            // Construction Staff: Get only completed requests assigned to them
            String staffId = userDetails.getId();
            completedRequests = maintenanceRequestService.getCompletedMaintenanceRequestsForStaff(staffId);
        }

        return ResponseEntity.ok(completedRequests);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_5')")
    @Operation(summary = "Update a pending maintenance request", description = "Updates a pending maintenance request. Only accessible by customers for their own requests.")
    public ResponseEntity<MaintenanceRequestDTO> updatePendingMaintenanceRequest(
            @PathVariable String id,
            @RequestBody MaintenanceRequestDTO updatedRequest,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String customerId = userDetails.getId();
        MaintenanceRequestDTO updatedDTO = maintenanceRequestService.updatePendingMaintenanceRequest(id, updatedRequest, customerId);
        return ResponseEntity.ok(updatedDTO);
    }

    @PostMapping("/{id}/deposit/cash")
    @PreAuthorize("hasRole('ROLE_2')")
    @Operation(summary = "Confirm deposit cash payment", description = "Consultant confirms deposit cash payment for maintenance request")
    public ResponseEntity<MaintenanceRequestDTO> confirmDepositCashPayment(
            @PathVariable String id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String consultantId = userDetails.getId();
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.confirmDepositCashPayment(id, consultantId);
        return ResponseEntity.ok(updatedRequest);
    }

    @PostMapping("/{id}/final/cash")
    @PreAuthorize("hasRole('ROLE_2')")
    @Operation(summary = "Confirm final cash payment", description = "Consultant confirms final cash payment for maintenance request")
    public ResponseEntity<MaintenanceRequestDTO> confirmFinalCashPayment(
            @PathVariable String id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String consultantId = userDetails.getId();
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.confirmFinalCashPayment(id, consultantId);
        return ResponseEntity.ok(updatedRequest);
    }

    @PostMapping("/{id}/deposit/vnpay")
    @PreAuthorize("hasRole('ROLE_5')")
    @Operation(summary = "Create VNPay deposit payment URL", description = "Creates VNPay URL for deposit payment")
    public ResponseEntity<Map<String, String>> createDepositVnpayPayment(
            @PathVariable String id,
            Authentication authentication,
            HttpServletRequest request) {  // Thêm HttpServletRequest
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String customerId = userDetails.getId();
        String paymentUrl = maintenanceRequestService.createDepositVnpayPayment(id, customerId, request);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @PostMapping("/{id}/final/vnpay")
    @PreAuthorize("hasRole('ROLE_5')")
    @Operation(summary = "Create VNPay final payment URL", description = "Creates VNPay URL for final payment")
    public ResponseEntity<Map<String, String>> createFinalVnpayPayment(
            @PathVariable String id,
            Authentication authentication,
            HttpServletRequest request) {  // Thêm HttpServletRequest
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String customerId = userDetails.getId();
        String paymentUrl = maintenanceRequestService.createFinalVnpayPayment(id, customerId, request);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @GetMapping("/vnpay-return") 
    @Operation(summary = "VNPay payment return", description = "Return endpoint for VNPay payment processing")
    public ResponseEntity<MaintenanceRequestDTO> processVnPayReturn(
        @RequestParam String vnp_Amount,
        @RequestParam String vnp_BankCode,
        @RequestParam String vnp_BankTranNo,
        @RequestParam String vnp_CardType,
        @RequestParam String vnp_OrderInfo,
        @RequestParam String vnp_ResponseCode,
        @RequestParam String vnp_TxnRef,
        @RequestParam(required = false) String vnp_TransactionNo) {
    
    try {
        // Extract request ID from vnp_TxnRef (format: requestId_timestamp)
        String requestId = vnp_TxnRef.split("_")[0];
        
        // Xác định loại thanh toán từ OrderInfo
        String paymentType = vnp_OrderInfo.contains("deposit") ? 
            "MAINTENANCE_DEPOSIT" : "MAINTENANCE_FINAL";
            
        MaintenanceRequestDTO updatedRequest = maintenanceRequestService.processVnPayCallback(
            requestId, vnp_ResponseCode, paymentType);
            
        return ResponseEntity.ok(updatedRequest);
    } catch (Exception e) {
        // Log error và return error response
        return ResponseEntity.badRequest().build();
    }
}

    @GetMapping("/completed-unpaid")
    @PreAuthorize("hasRole('ROLE_2')")
    @Operation(summary = "Get completed maintenance requests that need payment confirmation", 
              description = "Retrieves completed maintenance requests that need payment confirmation. Only accessible by consultants.")
    public ResponseEntity<List<MaintenanceRequestDTO>> getCompletedUnpaidRequests() {
        List<MaintenanceRequestDTO> requests = maintenanceRequestService.getCompletedUnpaidRequests();
        return ResponseEntity.ok(requests);
    }

    // Add more endpoints as needed
}
