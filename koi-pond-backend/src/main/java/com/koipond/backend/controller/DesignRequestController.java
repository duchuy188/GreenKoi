package com.koipond.backend.controller;

import com.koipond.backend.dto.DesignRequestDTO;
import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.service.DesignRequestService;
import com.koipond.backend.service.DesignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/design-requests")
@Tag(name = "Design Requests", description = "APIs for managing Koi pond design requests")
public class DesignRequestController {
    private final DesignRequestService designRequestService;
    private final DesignService designService;

    public DesignRequestController(
            DesignRequestService designRequestService,
            DesignService designService) {
        this.designRequestService = designRequestService;
        this.designService = designService;
    }

    @Operation(
        summary = "Create new design request",
        description = "Creates a new design request from an existing consultation request. " +
                "Only Consultant has permission to create design requests. Status: PENDING"
    )
    @PostMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAuthority('ROLE_2')")  // Consultant only
    public ResponseEntity<DesignRequestDTO> createFromConsultation(
            @Parameter(description = "ID of the consultation request") 
            @PathVariable String consultationId) {
        return ResponseEntity.ok(designRequestService.createFromConsultation(consultationId));
    }

    @Operation(
        summary = "Assign designer",
        description = "Assigns a designer to a design request. " +
                "Only Manager has permission to assign designers. Status: PENDING -> IN_PROGRESS"
    )
    @PutMapping("/{requestId}/assign/{designerId}")
    @PreAuthorize("hasAuthority('ROLE_1')")  // Manager only
    public ResponseEntity<DesignRequestDTO> assignDesigner(
            @Parameter(description = "ID of the design request") 
            @PathVariable String requestId,
            @Parameter(description = "ID of the designer to be assigned") 
            @PathVariable String designerId) {
        return ResponseEntity.ok(designRequestService.assignDesigner(requestId, designerId));
    }

    @Operation(
        summary = "Link design to request",
        description = "Links a completed design to the design request and adds design notes. Status: IN_PROGRESS -> COMPLETED"
    )
    @PutMapping("/{requestId}/link-design/{designId}")
    @PreAuthorize("hasAuthority('ROLE_3')")  // Designer only
    public ResponseEntity<DesignRequestDTO> linkDesignToRequest(
            @PathVariable String requestId,
            @PathVariable String designId,
            @RequestParam String designNotes,
            @RequestParam BigDecimal estimatedCost) {
        return ResponseEntity.ok(
            designRequestService.linkDesignToRequest(
                requestId, 
                designId,
                designNotes,
                estimatedCost
            )
        );
    }

    @Operation(
        summary = "Submit design for consultant review",
        description = "Designer submits completed design for consultant review. " +
                "Status: IN_PROGRESS -> COMPLETED"
    )
    @PostMapping("/{requestId}/submit-review")
    @PreAuthorize("hasAuthority('ROLE_3')")  // Designer only
    public ResponseEntity<DesignRequestDTO> submitForReview(
            @PathVariable String requestId) {
        return ResponseEntity.ok(designRequestService.submitForReview(requestId));
    }

    @Operation(
        summary = "Consultant review design",
        description = "Consultant reviews the design and approves/rejects it. " +
                "If approved: COMPLETED -> PENDING_CUSTOMER_APPROVAL (requires reviewNotes). " +
                "If rejected: COMPLETED -> IN_PROGRESS (requires rejectionReason)"
    )
    @PostMapping("/{requestId}/consultant-review")
    @PreAuthorize("hasAuthority('ROLE_2')")  // Consultant only
    public ResponseEntity<DesignRequestDTO> consultantReview(
            @PathVariable String requestId,
            @RequestParam(required = false) String reviewNotes,  // Optional when rejecting
            @RequestParam boolean approved,
            @RequestParam(required = false) String rejectionReason,  // Required when rejecting
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            designRequestService.consultantReview(
                requestId, 
                userDetails.getUsername(),
                reviewNotes, 
                approved,
                rejectionReason
            )
        );
    }

    @Operation(
        summary = "Customer approval",
        description = "Customer approves or rejects the reviewed design. " +
                "If approved: PENDING_CUSTOMER_APPROVAL -> APPROVED. " +
                "If rejected: PENDING_CUSTOMER_APPROVAL -> IN_PROGRESS (revisionCount increases)"
    )
    @PostMapping("/{requestId}/customer-approval")
    @PreAuthorize("hasAuthority('ROLE_5')")  // Customer only
    public ResponseEntity<DesignRequestDTO> customerApproval(
            @Parameter(description = "ID of the design request") 
            @PathVariable String requestId,
            @Parameter(description = "Approval decision") 
            @RequestParam(required = true) boolean approved,
            @Parameter(description = "Reason if rejected") 
            @RequestParam(required = false) String rejectionReason) {
        return ResponseEntity.ok(designRequestService.customerApproval(requestId, approved, rejectionReason));
    }

    @Operation(
        summary = "Get designer's requests",
        description = "Retrieves list of design requests assigned to the logged-in designer"
    )
    @GetMapping("/designer")
    @PreAuthorize("hasAuthority('ROLE_3')")  // Designer only
    public ResponseEntity<List<DesignRequestDTO>> getDesignerRequests(
            @Parameter(hidden = true) 
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(designRequestService.getDesignerRequests(userDetails.getUsername()));
    }

    @Operation(
        summary = "Get customer's requests",
        description = "Retrieves list of design requests for the logged-in customer"
    )
    @GetMapping("/customer")
    @PreAuthorize("hasAuthority('ROLE_5')")  // Customer only
    public ResponseEntity<List<DesignRequestDTO>> getCustomerRequests(
            @Parameter(hidden = true) 
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(designRequestService.getCustomerRequests(userDetails.getUsername()));
    }

    @Operation(
        summary = "Create custom design for request",
        description = "Designer creates a new custom design for the design request. " +
                "Status remains IN_PROGRESS until linked and submitted"
    )
    @PostMapping("/{requestId}/design")
    @PreAuthorize("hasAuthority('ROLE_3')")  // Designer only
    public ResponseEntity<DesignDTO> createDesignForRequest(
            @PathVariable String requestId,
            @RequestBody DesignDTO designDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            designService.createFromDesignRequest(
                designDTO, 
                userDetails.getUsername(),  // Truyền username của designer
                requestId
            )
        );
    }

    @Operation(
        summary = "Get designs pending consultant review",
        description = "Retrieves list of design requests that have been submitted and are waiting for consultant review (COMPLETED status)"
    )
    @GetMapping("/pending-review")
    @PreAuthorize("hasAuthority('ROLE_2')")  // Consultant only
    public ResponseEntity<List<DesignRequestDTO>> getPendingReviewRequests() {
        return ResponseEntity.ok(designRequestService.getPendingReviewRequests());
    }

    @Operation(
        summary = "Get designs pending assignment",
        description = "Retrieves list of design requests that are waiting for designer assignment (PENDING status). " +
                "Only Manager can access this endpoint."
    )
    @GetMapping("/pending-assignment")
    @PreAuthorize("hasAuthority('ROLE_1')")  // Manager only
    public ResponseEntity<List<DesignRequestDTO>> getPendingAssignmentRequests() {
        return ResponseEntity.ok(designRequestService.getPendingAssignmentRequests());
    }

    @Operation(
        summary = "Cancel design request",
        description = "Customer cancels the design request. Can cancel in states: PENDING, IN_PROGRESS, " +
                "COMPLETED, PENDING_CUSTOMER_APPROVAL. Cannot cancel APPROVED requests."
    )
    @PostMapping("/{requestId}/cancel")
    @PreAuthorize("hasAuthority('ROLE_5')")  // Customer only
    public ResponseEntity<DesignRequestDTO> cancelRequest(
        @Parameter(description = "ID of the design request") 
        @PathVariable String requestId,
        @Parameter(description = "Reason for cancellation") 
        @RequestParam(required = true) String rejectionReason
    ) {
        return ResponseEntity.ok(designRequestService.cancelRequest(requestId, rejectionReason));
    }

    @Operation(
        summary = "Get current design for request",
        description = "Get the current design created for this request"
    )
    @GetMapping("/{requestId}/current-design") 
    @PreAuthorize("hasAuthority('ROLE_3')")  // Designer only
    public ResponseEntity<DesignDTO> getCurrentDesign(
        @PathVariable String requestId,
        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(designService.getCurrentDesign(requestId, userDetails.getUsername()));
    }
}
