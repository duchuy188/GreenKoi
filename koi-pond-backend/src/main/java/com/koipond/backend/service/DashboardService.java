package com.koipond.backend.service;

import com.koipond.backend.dto.DashboardDTO;
import com.koipond.backend.repository.ProjectRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.BlogPostRepository;
import com.koipond.backend.repository.MaintenanceRequestRepository;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.BlogPost;
import com.koipond.backend.model.MaintenanceRequest;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
public class DashboardService {

    private static final String CUSTOMER_ROLE_ID = "5";
    private static final String CONSULTANT_ROLE_ID = "2";
    private static final String DESIGNER_ROLE_ID = "3";
    private static final String CONSTRUCTOR_ROLE_ID = "4";
    private static final String ONGOING_STATUS_ID = "PS4";
    private static final String COMPLETED_STATUS_ID = "PS6";

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;
    private final BlogPostRepository blogPostRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    public DashboardService(ProjectRepository projectRepository, UserRepository userRepository, 
                            DesignRepository designRepository, BlogPostRepository blogPostRepository,
                            MaintenanceRequestRepository maintenanceRequestRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
        this.blogPostRepository = blogPostRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    public DashboardDTO getAllDashboardData() {
        log.info("Starting getAllDashboardData");
        DashboardDTO dto = new DashboardDTO();
        try {
            log.info("Populating user stats");
            populateUserStats(dto);
            log.info("Populating project stats");
            populateProjectStats(dto);
            log.info("Populating revenue stats");
            populateRevenueStats(dto);
            log.info("Populating design stats");
            populateDesignStats(dto);
            log.info("Populating blog stats");
            populateBlogStats(dto);
            log.info("Populating maintenance stats");
            populateMaintenanceStats(dto);
            log.info("Completed getAllDashboardData successfully");
            return dto;
        } catch (Exception e) {
            log.error("Error in getAllDashboardData", e);
            throw e;
        }
    }

    public void populateUserStats(DashboardDTO dto) {
        log.info("Starting populateUserStats");
        try {
            dto.setTotalUsers(userRepository.count());
            dto.setCustomerCount(userRepository.countByRoleId(CUSTOMER_ROLE_ID));
            dto.setConsultantCount(userRepository.countByRoleId(CONSULTANT_ROLE_ID));
            dto.setDesignerCount(userRepository.countByRoleId(DESIGNER_ROLE_ID));
            dto.setConstructorCount(userRepository.countByRoleId(CONSTRUCTOR_ROLE_ID));
            log.info("Completed populateUserStats successfully");
        } catch (Exception e) {
            log.error("Error in populateUserStats", e);
            throw e;
        }
    }

    public void populateProjectStats(DashboardDTO dto) {
        log.info("Starting populateProjectStats");
        try {
            dto.setTotalProjects(projectRepository.count());
            dto.setOngoingProjects(projectRepository.countByStatusId(ONGOING_STATUS_ID));
            dto.setCompletedProjects(projectRepository.countByStatusId(COMPLETED_STATUS_ID));
            log.info("Completed populateProjectStats successfully");
        } catch (Exception e) {
            log.error("Error in populateProjectStats", e);
            throw e;
        }
    }

    public void populateRevenueStats(DashboardDTO dto) {
        log.info("Starting populateRevenueStats");
        try {
            dto.setTotalRevenue(projectRepository.sumTotalPriceByStatusId(COMPLETED_STATUS_ID));
            LocalDate startDate = LocalDate.now().minusMonths(11);
            List<Object[]> results = projectRepository.getRevenueByMonth(startDate);
            List<DashboardDTO.RevenueChartData> revenueChartData = results.stream()
                .map(result -> new DashboardDTO.RevenueChartData((String) result[0], (BigDecimal) result[1]))
                .collect(Collectors.toList());
            dto.setRevenueChartData(revenueChartData);
            log.info("Completed populateRevenueStats successfully");
        } catch (Exception e) {
            log.error("Error in populateRevenueStats", e);
            throw e;
        }
    }

    public void populateDesignStats(DashboardDTO dto) {
        log.info("Starting populateDesignStats");
        try {
            dto.setTotalDesigns(designRepository.countByActiveTrue());
            dto.setPendingDesigns(designRepository.countByStatusAndActiveTrue(Design.DesignStatus.PENDING_APPROVAL));
            dto.setApprovedDesigns(designRepository.countByStatusAndActiveTrue(Design.DesignStatus.APPROVED));
            dto.setRejectedDesigns(designRepository.countByStatusAndActiveTrue(Design.DesignStatus.REJECTED));
            log.info("Completed populateDesignStats successfully");
        } catch (Exception e) {
            log.error("Error in populateDesignStats", e);
            throw e;
        }
    }

    public void populateBlogStats(DashboardDTO dto) {
        log.info("Starting populateBlogStats");
        try {
            dto.setTotalBlogPosts(blogPostRepository.countByIsActiveTrue());
            dto.setDraftBlogPosts(blogPostRepository.countByStatusAndIsActiveTrue(BlogPost.BlogPostStatus.DRAFT));
            dto.setPendingApprovalBlogPosts(blogPostRepository.countByStatusAndIsActiveTrue(BlogPost.BlogPostStatus.PENDING_APPROVAL));
            dto.setApprovedBlogPosts(blogPostRepository.countByStatusAndIsActiveTrue(BlogPost.BlogPostStatus.APPROVED));
            dto.setRejectedBlogPosts(blogPostRepository.countByStatusAndIsActiveTrue(BlogPost.BlogPostStatus.REJECTED));
            log.info("Completed populateBlogStats successfully");
        } catch (Exception e) {
            log.error("Error in populateBlogStats", e);
            throw e;
        }
    }

    public void populateMaintenanceStats(DashboardDTO dto) {
        log.info("Starting populateMaintenanceStats");
        try {
            dto.setTotalMaintenanceRequests(maintenanceRequestRepository.count());
            dto.setPendingMaintenanceRequests(maintenanceRequestRepository.countByRequestStatus(MaintenanceRequest.RequestStatus.PENDING));
            dto.setInProgressMaintenanceRequests(maintenanceRequestRepository.countByMaintenanceStatus(MaintenanceRequest.MaintenanceStatus.IN_PROGRESS));
            dto.setCompletedMaintenanceRequests(maintenanceRequestRepository.countByMaintenanceStatus(MaintenanceRequest.MaintenanceStatus.COMPLETED));
            dto.setCancelledMaintenanceRequests(maintenanceRequestRepository.countByRequestStatus(MaintenanceRequest.RequestStatus.CANCELLED));
            log.info("Completed populateMaintenanceStats successfully");
        } catch (Exception e) {
            log.error("Error in populateMaintenanceStats", e);
            throw e;
        }
    }
}
