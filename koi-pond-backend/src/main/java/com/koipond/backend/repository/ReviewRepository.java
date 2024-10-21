package com.koipond.backend.repository;

import com.koipond.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    Optional<Review> findByMaintenanceRequestId(String maintenanceRequestId);
    Optional<Review> findByProjectId(String projectId);
    List<Review> findByCustomerId(String customerId);
    boolean existsByMaintenanceRequestId(String maintenanceRequestId);
    boolean existsByProjectId(String projectId);
}
