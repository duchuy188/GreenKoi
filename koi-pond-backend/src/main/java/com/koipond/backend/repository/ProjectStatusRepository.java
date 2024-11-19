package com.koipond.backend.repository;

import com.koipond.backend.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectStatusRepository extends JpaRepository<ProjectStatus, String> {
    Optional<ProjectStatus> findByName(String name);
}