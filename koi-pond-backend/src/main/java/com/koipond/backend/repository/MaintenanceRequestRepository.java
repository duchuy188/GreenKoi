package com.koipond.backend.repository;

import com.koipond.backend.model.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, String> {
    List<MaintenanceRequest> findByCustomerId(String customerId);
    List<MaintenanceRequest> findByProjectId(String projectId);
    List<MaintenanceRequest> findByAssignedToId(String assignedToId);
    List<MaintenanceRequest> findByConsultantId(String consultantId);
    List<MaintenanceRequest> findByRequestStatus(MaintenanceRequest.RequestStatus status);
    
    List<MaintenanceRequest> findByAssignedToIdAndMaintenanceStatus(String assignedToId, MaintenanceRequest.MaintenanceStatus status);
    List<MaintenanceRequest> findByRequestStatusAndAssignedToIsNull(MaintenanceRequest.RequestStatus status);

    // Các phương thức mới
    List<MaintenanceRequest> findByCustomerIdAndRequestStatusIn(String customerId, List<MaintenanceRequest.RequestStatus> statuses);
    List<MaintenanceRequest> findByConsultantIdAndRequestStatusInAndMaintenanceStatusIsNull(String consultantId, List<MaintenanceRequest.RequestStatus> statuses);
    List<MaintenanceRequest> findByRequestStatusAndMaintenanceStatusIsNull(MaintenanceRequest.RequestStatus status);
}
