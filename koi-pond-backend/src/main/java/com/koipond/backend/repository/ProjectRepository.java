package com.koipond.backend.repository;

import com.koipond.backend.model.Project;
import com.koipond.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    // Tìm dự án theo tên
    Optional<Project> findByName(String name);

    // Tìm tất cả dự án của một khách hàng cụ thể
    List<Project> findByCustomer(User customer);

    // Tìm tất cả dự án của một nhân viên tư vấn cụ thể
    List<Project> findByConsultant(User consultant);

    // Tìm tất cả dự án có trạng thái cụ thể
    List<Project> findByStatus_Name(String statusName);

    // Đếm số lượng dự án của một khách hàng
    long countByCustomer(User customer);

    // Tìm dự án theo địa chỉ (sử dụng LIKE để tìm kiếm một phần của địa chỉ)
    @Query("SELECT p FROM Project p WHERE p.address LIKE %:address%")
    List<Project> findByAddressContaining(@Param("address") String address);

    // Tìm dự án trong khoảng giá cụ thể
    @Query("SELECT p FROM Project p WHERE p.totalPrice BETWEEN :minPrice AND :maxPrice")
    List<Project> findByPriceRange(@Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice);

    // Tìm tất cả dự án của một nhân viên tư vấn cụ thể theo ID
    List<Project> findByConsultantId(String consultantId);

    // Tìm tất cả dự án của một khách hàng cụ thể theo ID
    List<Project> findByCustomerId(String customerId);

  
    List<Project> findByCustomerIdAndStatus_Name(String customerId, String statusName);

    
    boolean existsByIdAndCustomerIdAndStatus_Name(String id, String customerId, String statusName);

   
    List<Project> findByConstructorId(String constructorId);

    // Đếm số lượng dự án theo trạng thái
    long countByStatusId(String statusId);

    // Tính tổng doanh thu của các dự án đã hoàn thành
    @Query("SELECT COALESCE(SUM(p.totalPrice), 0) FROM Project p WHERE p.status.id = :statusId")
    BigDecimal sumTotalPriceByStatusId(@Param("statusId") String statusId);

    // Lấy doanh thu theo tháng cho biểu đồ
    @Query("SELECT FORMAT(p.endDate, 'yyyy-MM') as date, COALESCE(SUM(p.totalPrice), 0) as revenue " +
           "FROM Project p " +
           "WHERE p.status.id = 'PS6' AND p.endDate >= :startDate " +
           "GROUP BY FORMAT(p.endDate, 'yyyy-MM') " +
           "ORDER BY FORMAT(p.endDate, 'yyyy-MM')")
    List<Object[]> getRevenueByMonth(@Param("startDate") LocalDate startDate);

    // Thêm method này vào interface ProjectRepository
    @Query("SELECT COUNT(p) > 0 FROM Project p " +
           "WHERE p.constructor.id = :constructorId " +
           "AND p.status.name NOT IN :statusNames")
    boolean existsByConstructorIdAndStatusNameNotIn(
        @Param("constructorId") String constructorId, 
        @Param("statusNames") List<String> statusNames
    );
}
