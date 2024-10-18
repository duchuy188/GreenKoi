package com.koipond.backend.controller;

import com.koipond.backend.dto.MaintenanceRequestDTO;
import com.koipond.backend.service.MaintenanceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-requests")
public class MaintenanceRequestController {

    @Autowired
    private MaintenanceRequestService maintenanceRequestService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_5')")  // Assuming ROLE_5 is for customers
    public ResponseEntity<MaintenanceRequestDTO> createMaintenanceRequest(@RequestBody MaintenanceRequestDTO request) {
        MaintenanceRequestDTO createdRequest = maintenanceRequestService.createMaintenanceRequest(request);
        return ResponseEntity.ok(createdRequest);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ROLE_5')")
    public ResponseEntity<List<MaintenanceRequestDTO>> getCustomerMaintenanceRequests(@PathVariable String customerId) {
        List<MaintenanceRequestDTO> requests = maintenanceRequestService.getMaintenanceRequestsByCustomer(customerId);
        return ResponseEntity.ok(requests);
    }

    // Add more endpoints as needed
}