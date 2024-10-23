package com.koipond.backend.repository;

import com.koipond.backend.model.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, String> {
    List<MaintenanceRequest> findByCustomerId(String customerId);
    List<MaintenanceRequest> findByRequestStatus(MaintenanceRequest.RequestStatus status);
    List<MaintenanceRequest> findByAssignedToIdAndMaintenanceStatus(String assignedToId, MaintenanceRequest.MaintenanceStatus status);
    List<MaintenanceRequest> findByRequestStatusAndMaintenanceStatusIsNull(MaintenanceRequest.RequestStatus status);

    // Thêm các phương thức đếm cho dashboard
    long countByRequestStatus(MaintenanceRequest.RequestStatus status);
    long countByMaintenanceStatus(MaintenanceRequest.MaintenanceStatus status);
    
    // Thêm phương thức đếm tổng số yêu cầu bảo trì đang hoạt động (không bị hủy)
    long countByRequestStatusNot(MaintenanceRequest.RequestStatus status);
    
    // Thêm phương thức đếm số yêu cầu bảo trì theo trạng thái yêu cầu và trạng thái bảo trì
    long countByRequestStatusAndMaintenanceStatus(MaintenanceRequest.RequestStatus requestStatus, MaintenanceRequest.MaintenanceStatus maintenanceStatus);
    
    // Thêm phương thức đếm số yêu cầu bảo trì đang chờ xử lý (pending và chưa có trạng thái bảo trì)
    long countByRequestStatusAndMaintenanceStatusIsNull(MaintenanceRequest.RequestStatus requestStatus);
}
