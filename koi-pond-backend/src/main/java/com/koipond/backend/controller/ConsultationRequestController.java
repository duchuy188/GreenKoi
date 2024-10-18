package com.koipond.backend.controller;

import com.koipond.backend.dto.ConsultationRequest;
import com.koipond.backend.service.ConsultationRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/api/ConsultationRequests")
@Tag(name = "ConsultationRequests", description = "API for managing consultation requests")
public class ConsultationRequestController {

    private final ConsultationRequestService consultationRequestService;

    @Autowired
    public ConsultationRequestController(ConsultationRequestService consultationRequestService) {
        this.consultationRequestService = consultationRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody ConsultationRequest dto, Authentication authentication) {
        try {
            String username = authentication.getName();
            com.koipond.backend.model.ConsultationRequest createdRequest = consultationRequestService.createRequest(dto, username);
            return ResponseEntity.ok(createdRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ConsultationRequest>> getConsultationRequests(Authentication authentication) {
        String username = authentication.getName();
        List<ConsultationRequest> requests = consultationRequestService.getConsultationRequests(username);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ConsultationRequest> updateStatus(
            @PathVariable String id,
            @RequestParam String newStatus,
            Authentication authentication) {
        String username = authentication.getName();
        ConsultationRequest updatedRequest = consultationRequestService.updateStatus(id, newStatus, username);
        return ResponseEntity.ok(updatedRequest);
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getValidStatuses() {
        return ResponseEntity.ok(consultationRequestService.getValidStatuses());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ConsultationRequest>> getConsultationRequestsByCustomerId(
            @PathVariable String customerId,
            Authentication authentication) {
        // Có thể thêm kiểm tra quyền truy cập ở đây nếu cần
        List<ConsultationRequest> requests = consultationRequestService.getConsultationRequestsByCustomerId(customerId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomerRequest(
            @PathVariable String id,
            @RequestBody ConsultationRequest updatedDTO,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            ConsultationRequest updatedRequest = consultationRequestService.updateCustomerRequest(id, updatedDTO, username);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelCustomerRequest(
            @PathVariable String id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            consultationRequestService.cancelCustomerRequest(id, username);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}