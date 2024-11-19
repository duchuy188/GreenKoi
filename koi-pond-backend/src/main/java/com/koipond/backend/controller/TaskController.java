package com.koipond.backend.controller;

import com.koipond.backend.dto.TaskDTO;
import com.koipond.backend.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PatchMapping("/{taskId}/status")
    @PreAuthorize("hasAuthority('ROLE_4')")
    @Operation(summary = "Update task status and completion percentage", description = "Updates the status and completion percentage of a specific task. Only accessible by assigned construction staff.")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable String taskId,
            @RequestParam String newStatus,
            @RequestParam Integer completionPercentage,
            Authentication authentication) {
        
        logger.info("Received request to update task status. TaskId: {}, NewStatus: {}, CompletionPercentage: {}, User: {}", 
                    taskId, newStatus, completionPercentage, authentication.getName());
        
        try {
            TaskDTO updatedTask = taskService.updateTaskStatus(taskId, newStatus, completionPercentage, authentication.getName());
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            logger.error("Error updating task status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating task status: " + e.getMessage());
        }
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ROLE_1', 'ROLE_4')")
    public ResponseEntity<List<TaskDTO>> getTasksByProjectId(@PathVariable String projectId, Authentication authentication) {
        logger.info("Received request to get tasks for project: {}. User: {}, Authorities: {}", 
                    projectId, authentication.getName(), authentication.getAuthorities());
        List<TaskDTO> tasks = taskService.getTasksByProjectId(projectId, authentication.getName());
        return ResponseEntity.ok(tasks);
    }
}
