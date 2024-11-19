package com.koipond.backend.repository;

import com.koipond.backend.model.TaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, String> {
    List<TaskTemplate> findAllByOrderByOrderIndexAsc();
}