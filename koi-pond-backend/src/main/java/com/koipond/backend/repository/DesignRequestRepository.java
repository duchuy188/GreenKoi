package com.koipond.backend.repository;

import com.koipond.backend.model.DesignRequest;
import com.koipond.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesignRequestRepository extends JpaRepository<DesignRequest, String> {
    // Tìm theo designer
    List<DesignRequest> findByDesigner(User designer);
    List<DesignRequest> findByDesignerId(String designerId);

    // Tìm theo consultation
    Optional<DesignRequest> findByConsultationId(String consultationId);
    List<DesignRequest> findByConsultation_Customer(User customer);
    List<DesignRequest> findByConsultation_CustomerId(String customerId);

    // Tìm theo status
    List<DesignRequest> findByStatus(DesignRequest.DesignRequestStatus status);
    List<DesignRequest> findByStatusIn(List<DesignRequest.DesignRequestStatus> statuses);

    // Tìm theo design
    Optional<DesignRequest> findByDesignId(String designId);

    // Tìm theo designer và status
    List<DesignRequest> findByDesignerIdAndStatus(String designerId, DesignRequest.DesignRequestStatus status);
    List<DesignRequest> findByDesignerIdAndStatusIn(String designerId, List<DesignRequest.DesignRequestStatus> statuses);

    // Kiểm tra tồn tại
    boolean existsByConsultationId(String consultationId);
    boolean existsByDesignId(String designId);

    @Query("SELECT d FROM DesignRequest d WHERE d.consultation.customer = :customer")
    List<DesignRequest> findByCustomer(@Param("customer") User customer);
}
