package com.koipond.backend.controller;

import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.dto.RejectDesignRequest;
import com.koipond.backend.service.DesignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/pond-designs")
@Tag(name = "Pond Design", description = "Pond Design management APIs")
public class PondDesignController {

    @Autowired
    private DesignService designService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_3')")  // Assuming ROLE_3 is for Design Staff
    @Operation(summary = "Create a new pond design", 
               description = "Creates a new pond design. Only designers (ROLE_3) can perform this action.")
    public ResponseEntity<DesignDTO> createDesign(@RequestBody DesignDTO designDTO, Authentication authentication) {
        String designerUsername = authentication.getName();
        DesignDTO createdDesign = designService.createDesign(designDTO, designerUsername);
        return ResponseEntity.ok(createdDesign);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a pond design by ID", 
               description = "Retrieves the details of a specific pond design based on the provided ID.")
    public ResponseEntity<DesignDTO> getDesign(@PathVariable String id) {
        DesignDTO design = designService.getDesign(id);
        return ResponseEntity.ok(design);
    }

    @GetMapping("/designer")
    @PreAuthorize("hasAuthority('ROLE_3')")
    @Operation(summary = "Get designs by current designer", 
               description = "Retrieves a list of pond designs created by the currently authenticated designer.")
    public ResponseEntity<List<DesignDTO>> getDesignerDesigns(Authentication authentication) {
        String designerUsername = authentication.getName();
        List<DesignDTO> designs = designService.getDesignsByDesigner(designerUsername);
        return ResponseEntity.ok(designs);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_1')")  // Assuming ROLE_1 is for Managers
    @Operation(summary = "Get all pending pond designs", 
               description = "Retrieves a list of all pending pond designs. Only managers (ROLE_1) can access this endpoint.")
    public ResponseEntity<List<DesignDTO>> getPendingApprovalDesigns() {
        List<DesignDTO> designs = designService.getPendingApprovalDesigns();
        return ResponseEntity.ok(designs);
    }

    @GetMapping("/approved")
    @Operation(summary = "Get all approved pond designs", 
               description = "Retrieves a list of all approved pond designs. This endpoint is accessible to all authenticated users.")
    public ResponseEntity<List<DesignDTO>> getApprovedDesigns() {
        List<DesignDTO> designs = designService.getApprovedDesigns();
        return ResponseEntity.ok(designs);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_3')")
    @Operation(summary = "Update a pond design", 
               description = "Updates the details of an existing pond design. Only designers (ROLE_3) can perform this action.")
    public ResponseEntity<DesignDTO> updateDesign(@PathVariable String id, @RequestBody DesignDTO designDTO) {
        DesignDTO updatedDesign = designService.updateDesign(id, designDTO);
        return ResponseEntity.ok(updatedDesign);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_1')")
    @Operation(summary = "Approve a pond design", 
               description = "Approves a specific pond design. Only managers (ROLE_1) can perform this action.")
    public ResponseEntity<DesignDTO> approveDesign(@PathVariable String id) {
        DesignDTO approvedDesign = designService.approveDesign(id);
        return ResponseEntity.ok(approvedDesign);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_1')")
    @Operation(summary = "Reject a pond design", 
               description = "Rejects a specific pond design with a reason. Only managers (ROLE_1) can perform this action.")
    public ResponseEntity<DesignDTO> rejectDesign(@PathVariable String id, @RequestBody RejectDesignRequest request) {
        DesignDTO rejectedDesign = designService.rejectDesign(id, request.getRejectionReason());
        return ResponseEntity.ok(rejectedDesign);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_3')")  // Thay đổi từ hasRole thành hasAuthority
    @Operation(summary = "Delete a pond design", 
               description = "Deletes a specific pond design. Only designers (ROLE_3) can perform this action.")
    public ResponseEntity<Void> deleteDesign(@PathVariable String id) {
        designService.deleteDesign(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search pond designs by name", 
               description = "Searches for pond designs based on the provided name. This endpoint is accessible to all authenticated users.")
    public ResponseEntity<List<DesignDTO>> searchDesigns(@RequestParam String name) {
        List<DesignDTO> designs = designService.searchDesignsByName(name);
        return ResponseEntity.ok(designs);
    }


    @PutMapping("/{id}/approve-public")
    @PreAuthorize("hasAuthority('ROLE_5')")  // Customer
    @Operation(summary = "Approve design for public display")
    public ResponseEntity<DesignDTO> approvePublicDesign(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(
            designService.approvePublicDesign(id, authentication.getName())
        );
    }

    @GetMapping("/public")
    @Operation(summary = "Get public designs")
    public ResponseEntity<List<DesignDTO>> getPublicDesigns() {
        return ResponseEntity.ok(designService.getPublicDesigns());
    }

    @PutMapping("/{id}/suggest-public")
    @PreAuthorize("hasAuthority('ROLE_1')")  // Manager
    @Operation(summary = "Suggest design for public display", 
          description = "Manager suggests a custom design for public display")
    public ResponseEntity<DesignDTO> suggestPublicDesign(@PathVariable String id) {
        return ResponseEntity.ok(designService.suggestPublicDesign(id));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('ROLE_1')")  // Manager
    @Operation(summary = "Publish design", 
          description = "Manager publishes a design after customer approval")
    public ResponseEntity<DesignDTO> publishDesign(@PathVariable String id) {
        return ResponseEntity.ok(designService.publishDesign(id));
    }
}
