package com.koipond.backend.repository;

import com.koipond.backend.model.ProjectCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectCancellationRepository extends JpaRepository<ProjectCancellation, String> {
}