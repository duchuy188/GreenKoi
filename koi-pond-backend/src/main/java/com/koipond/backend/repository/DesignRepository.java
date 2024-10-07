package com.koipond.backend.repository;

import com.koipond.backend.model.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DesignRepository extends JpaRepository<Design, String> {
    // Các phương thức tùy chỉnh có thể được thêm vào đây nếu cần
}