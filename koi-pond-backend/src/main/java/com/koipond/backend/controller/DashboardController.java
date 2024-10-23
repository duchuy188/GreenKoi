package com.koipond.backend.controller;

import com.koipond.backend.dto.DashboardDTO;
import com.koipond.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAuthority('ROLE_1')")
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Get all dashboard data", description = "Retrieves all dashboard data in one call.")
    public ResponseEntity<DashboardDTO> getAllDashboardData() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received request for getAllDashboardData from user: {}", username);
        try {
            DashboardDTO data = dashboardService.getAllDashboardData();
            log.info("Returning dashboard data: {}", data);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Error getting dashboard data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/user-stats")
    @Operation(summary = "Get user statistics", description = "Retrieves user count statistics.")
    public ResponseEntity<DashboardDTO> getUserStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received request for getUserStats from user: {}", username);
        try {
            DashboardDTO dto = new DashboardDTO();
            dashboardService.populateUserStats(dto);
            log.info("Returning user stats: {}", dto);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting user stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/project-stats")
    @Operation(summary = "Get project statistics", description = "Retrieves project count statistics.")
    public ResponseEntity<DashboardDTO> getProjectStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received request for getProjectStats from user: {}", username);
        try {
            DashboardDTO dto = new DashboardDTO();
            dashboardService.populateProjectStats(dto);
            log.info("Returning project stats: {}", dto);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting project stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue statistics", description = "Retrieves revenue statistics and chart data.")
    public ResponseEntity<DashboardDTO> getRevenueStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received request for getRevenueStats from user: {}", username);
        try {
            DashboardDTO dto = new DashboardDTO();
            dashboardService.populateRevenueStats(dto);
            log.info("Returning revenue stats: {}", dto);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting revenue stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/design-stats")
    @Operation(summary = "Get design statistics", description = "Retrieves design count statistics.")
    public ResponseEntity<DashboardDTO> getDesignStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received request for getDesignStats from user: {}", username);
        try {
            DashboardDTO dto = new DashboardDTO();
            dashboardService.populateDesignStats(dto);
            log.info("Returning design stats: {}", dto);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting design stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/blog-stats")
    @Operation(summary = "Get blog statistics", description = "Retrieves blog post count statistics.")
    public ResponseEntity<DashboardDTO> getBlogStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received request for getBlogStats from user: {}", username);
        try {
            DashboardDTO dto = new DashboardDTO();
            dashboardService.populateBlogStats(dto);
            log.info("Returning blog stats: {}", dto);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting blog stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/maintenance-stats")
    @Operation(summary = "Get maintenance statistics", description = "Retrieves maintenance request count statistics.")
    public ResponseEntity<DashboardDTO> getMaintenanceStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Received request for getMaintenanceStats from user: {}", username);
        try {
            DashboardDTO dto = new DashboardDTO();
            dashboardService.populateMaintenanceStats(dto);
            log.info("Returning maintenance stats: {}", dto);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting maintenance stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
