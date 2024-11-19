package com.koipond.backend.service;

import com.koipond.backend.dto.TaskDTO;
import com.koipond.backend.model.Task;
import com.koipond.backend.model.Project;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.TaskRepository;
import com.koipond.backend.repository.ProjectRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;



@Service
public class TaskService {
    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    // Nếu bạn cần giữ lại ROLE_MANAGER cho sử dụng trong tương lai
    @SuppressWarnings("unused")
    private static final String ROLE_MANAGER = "1";
    private static final String ROLE_CONSTRUCTION_STAFF = "4";

    @Autowired
    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByProjectId(String projectId, String username) {
        logger.info("Fetching tasks for project: {} by user: {}", projectId, username);
        // Implement logic to fetch tasks
        // Make sure to check user permissions here if needed
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        logger.info("User role: {}", user.getRoleId());

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        logger.info("Project found: {}", project.getId());

        if (user.getRoleId().equals(ROLE_CONSTRUCTION_STAFF)) {
            logger.info("User is construction staff, checking project assignment");
            if (project.getConstructor() == null || !project.getConstructor().getId().equals(user.getId())) {
                logger.warn("User {} is not assigned to project {}", username, projectId);
                throw new AccessDeniedException("You are not assigned to this project");
            }
            logger.info("User is correctly assigned to the project");
        }

        List<Task> tasks = taskRepository.findByProjectIdOrderByOrderIndexAsc(projectId);
        logger.info("Found {} tasks for project {}", tasks.size(), projectId);
        return tasks.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO updateTaskStatus(String taskId, String newStatus, Integer completionPercentage, String username) {
        logger.info("Updating task status. TaskId: {}, NewStatus: {}, CompletionPercentage: {}, Username: {}", 
                taskId, newStatus, completionPercentage, username);
        
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> {
                logger.error("Task not found with id: {}", taskId);
                return new ResourceNotFoundException("Task not found with id: " + taskId);
            });
        
        Project project = task.getProject();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        if (!user.getRoleId().equals(ROLE_CONSTRUCTION_STAFF) || 
            !user.getId().equals(project.getConstructor().getId())) {
            throw new AccessDeniedException("You are not authorized to update this task");
        }
        
        task.setStatus(newStatus);
        task.setCompletionPercentage(completionPercentage);
        Task updatedTask = taskRepository.save(task);
        
        updateProjectProgress(project.getId());
        
        logger.info("Task updated successfully. TaskId: {}", taskId);
        return convertToDTO(updatedTask);
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setProjectId(task.getProject().getId());
        dto.setName(task.getName());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setOrderIndex(task.getOrderIndex());
        dto.setCompletionPercentage(task.getCompletionPercentage());
        dto.setNotes(task.getNotes());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public boolean areAllTasksCompleted(String projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream().allMatch(task -> 
            task.getCompletionPercentage() == 100 && "COMPLETED".equals(task.getStatus())
        );
    }

    private void updateProjectProgress(String projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        int progressPercentage = (totalTasks > 0) ? (completedTasks * 100) / totalTasks : 0;
        
        project.setProgressPercentage(progressPercentage);
        projectRepository.save(project);
        
        logger.info("Project progress updated: {}. New progress: {}%", projectId, progressPercentage);
    }
}
