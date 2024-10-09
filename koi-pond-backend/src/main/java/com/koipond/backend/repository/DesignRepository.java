package com.koipond.backend.repository;

import com.koipond.backend.model.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesignRepository extends JpaRepository<Design, String> {
    List<Design> findByCreatedBy_Id(String createdById);
    List<Design> findByActiveTrue();
    List<Design> findByStatusAndActiveTrue(Design.DesignStatus status);
    Optional<Design> findByIdAndActiveTrue(String id);
    List<Design> findByCreatedBy_IdAndActiveTrue(String createdById);
}