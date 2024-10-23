package com.koipond.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class DashboardDTO {
    private long totalProjects;
    private long ongoingProjects;
    private long completedProjects;
    private long totalUsers;
    private long customerCount;
    private long consultantCount;
    private long designerCount;
    private long constructorCount;
    private BigDecimal totalRevenue;
    private List<RevenueChartData> revenueChartData;
    
   
    private long totalDesigns;
    private long pendingDesigns;
    private long approvedDesigns;
    private long rejectedDesigns;

    private long totalBlogPosts;
    private long draftBlogPosts;
    private long pendingApprovalBlogPosts;
    private long approvedBlogPosts;
    private long rejectedBlogPosts;

    // Add new fields for maintenance request stats
    private long totalMaintenanceRequests;
    private long pendingMaintenanceRequests;
    private long inProgressMaintenanceRequests;
    private long completedMaintenanceRequests;
    private long cancelledMaintenanceRequests;

    @Getter
    @Setter
    public static class RevenueChartData {
        private String date;
        private BigDecimal revenue;

        public RevenueChartData(String date, BigDecimal revenue) {
            this.date = date;
            this.revenue = revenue;
        }
    }
}
