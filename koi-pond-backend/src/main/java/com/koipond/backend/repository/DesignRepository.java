package com.koipond.backend.repository;

import com.koipond.backend.model.Design;
import com.koipond.backend.model.DesignRequest;
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
    List<Design> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    // Thêm các phương thức mới để đếm số lượng thiết kế
    long countByActiveTrue();
    long countByStatusAndActiveTrue(Design.DesignStatus status);

    // Thêm các method mới cho mẫu thiết kế
    // 1. Lấy mẫu thiết kế public
    List<Design> findByIsPublicTrueAndStatusAndActiveTrue(Design.DesignStatus status);
    
    // 2. Lấy mẫu thiết kế thông thường (không phải custom)
    List<Design> findByIsPublicTrueAndIsCustomFalseAndStatusAndActiveTrue(
        Design.DesignStatus status);
    
    // 3. Lấy thiết kế theo yêu cầu của khách
    List<Design> findByIsCustomTrueAndCreatedBy_IdAndActiveTrue(String customerId);
    
    // 4. Đếm số lượng theo loại
    long countByIsCustomTrueAndActiveTrue(); // Đếm thiết kế theo yêu cầu
    long countByIsPublicTrueAndActiveTrue(); // Đếm mẫu public
    
    // 5. Tìm kiếm nâng cao
    List<Design> findByIsPublicTrueAndStatusAndActiveTrueOrderByCreatedAtDesc(
        Design.DesignStatus status); // Mẫu mới nhất
        
    List<Design> findByIsCustomTrueAndStatusAndActiveTrueOrderByCreatedAtDesc(
        Design.DesignStatus status); // Thiết kế theo yêu cầu mới nhất

    // Sửa lại method lấy thiết kế public
    List<Design> findByIsPublicTrueAndActiveTrue();  // Bỏ tham số status

    // Thêm method để lấy design mới nhất của designer
    Optional<Design> findFirstByCreatedBy_UsernameAndIsCustomTrueOrderByCreatedAtDesc(
        String username
    );

    // Thêm method để kiểm tra design đã tồn tại cho request
    boolean existsByDesignRequest(DesignRequest designRequest);
    
    // Thêm method để tìm design theo request
    Optional<Design> findByDesignRequest(DesignRequest designRequest);
}
