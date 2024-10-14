package com.koipond.backend.repository;

import com.koipond.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByProjectIdOrderByOrderIndexAsc(String projectId);
    
    List<Task> findByProjectId(String projectId);
}
