package com.koipond.backend.controller;

import com.koipond.backend.dto.ConsultationRequestDTO;
import com.koipond.backend.model.ConsultationRequest;
import com.koipond.backend.service.ConsultationRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

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
    public ResponseEntity<?> createRequest(@RequestBody ConsultationRequestDTO dto, Authentication authentication) {
        try {
            String username = authentication.getName();
            ConsultationRequest createdRequest = consultationRequestService.createRequest(dto, username);
            return ResponseEntity.ok(createdRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}