     package com.koipond.backend.controller;

import com.koipond.backend.dto.*;
import com.koipond.backend.dto.CancelProjectRequest;
import com.koipond.backend.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Project Management", description = "APIs for managing projects")
public class ProjectController {

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_1')")
    @Operation(summary = "Get all projects", description = "Retrieves a list of all projects. Only accessible by managers.")
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        List<ProjectDTO> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/consultant")
    @PreAuthorize("hasAuthority('ROLE_2')")
    @Operation(summary = "Get consultant's projects", description = "Retrieves a list of projects assigned to the authenticated consultant.")
    public ResponseEntity<List<ProjectDTO>> getConsultantProjects(Authentication authentication) {
        String consultantUsername = getUsernameFromAuthentication(authentication);
        List<ProjectDTO> projects = projectService.getProjectsByConsultant(consultantUsername);
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_2')")
    @Operation(summary = "Create a new project", description = "Creates a new project from consultation details. Initial status will be PENDING.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Project created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody CreateProjectRequest request, Authentication authentication) {
        String consultantUsername = getUsernameFromAuthentication(authentication);
        ProjectDTO createdProject = projectService.createProject(request, consultantUsername);
        return ResponseEntity.status(201).body(createdProject);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_2')")
    @Operation(summary = "Update a project", description = "Updates an existing project. Only the assigned consultant can update.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Project updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable String id, @Valid @RequestBody UpdateProjectRequest request, Authentication authentication) {
        String consultantUsername = getUsernameFromAuthentication(authentication);
        ProjectDTO updatedProject = projectService.updateProject(id, request, consultantUsername);
        return ResponseEntity.ok(updatedProject);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_1', 'ROLE_2')")
    @Operation(summary = "Update project status", description = "Updates the status of an existing project. Managers can update any project, consultants can only update their assigned projects.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Project status updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or invalid status transition"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<ProjectDTO> updateProjectStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectStatusRequest request,
            Authentication authentication) {
        String username = getUsernameFromAuthentication(authentication);
        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_1"));
        ProjectDTO updatedProject = projectService.updateProjectStatus(id, request.getNewStatus(), username, isManager);
        return ResponseEntity.ok(updatedProject);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_1', 'ROLE_2')")
    @Operation(summary = "Cancel a project", description = "Cancels an existing project. Managers can cancel any project, consultants can only request cancellation for their assigned projects.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Project cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<ProjectDTO> cancelProject(@PathVariable String id, @Valid @RequestBody CancelProjectRequest request, Authentication authentication) {
        String username = getUsernameFromAuthentication(authentication);
        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_1"));
        ProjectDTO cancelledProject = projectService.cancelProject(id, request, username, isManager);
        return ResponseEntity.ok(cancelledProject);
    }
    
    private String getUsernameFromAuthentication(Authentication authentication) {
        return authentication.getName();
    }
}