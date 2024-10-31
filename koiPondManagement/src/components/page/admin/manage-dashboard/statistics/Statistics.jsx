import { useEffect, useState } from 'react';
import axios from '../../../../config/axios';
import './Statistics.css';
import UserStatistics from './user-statistic/UserStatistics';
import RevenueStatistics from './revenue-statistics/RevenueStatistics';
import ProjectStatistics from './project-statistics/ProjectStatistics';
import MaintenanceStatistics from './maintenance-statistics/MaintenanceStatistics';
import DesignStatistics from './design-statistics/DesignStatistics';
import BlogStatistics from './blog-statistics/BlogStatistics';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    totalUsers: 0,
    customerCount: 0,
    designerCount: 0,
    constructorCount: 0,
    totalRevenue: 0,
    revenueChartData: [],
    totalDesigns: 0,
    pendingDesigns: 0,
    approvedDesigns: 0,
    rejectedDesigns: 0,
    totalBlogPosts: 0,
    draftBlogPosts: 0,
    approvedBlogPosts: 0,
    rejectedBlogPosts: 0,
    totalMaintenanceRequests: 0,
    pendingMaintenanceRequests: 0,
    approvedMaintenanceRequests: 0,
    completedMaintenanceRequests: 0,
    cancelledMaintenanceRequests: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="statistics-container">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Dự án</h3>
          <p>Tổng số: {stats.totalProjects}</p>
          <p>Đang thực hiện: {stats.ongoingProjects}</p>
          <p>Đã hoàn thành: {stats.completedProjects}</p>
        </div>

        <div className="stat-card">
          <h3>Người dùng</h3>
          <p>Tổng số: {stats.totalUsers}</p>
          <p>Khách hàng: {stats.customerCount}</p>
          <p>Thiết kế: {stats.designerCount}</p>
          <p>Thi công: {stats.constructorCount}</p>
        </div>

        <div className="stat-card">
          <h3>Thiết kế</h3>
          <p>Tổng số: {stats.totalDesigns}</p>
          <p>Đang chờ: {stats.pendingDesigns}</p>
          <p>Đã duyệt: {stats.approvedDesigns}</p>
          <p>Đã từ chối: {stats.rejectedDesigns}</p>
        </div>

        <div className="stat-card">
          <h3>Blog</h3>
          <p>Tổng số: {stats.totalBlogPosts}</p>
          <p>Bản nháp: {stats.draftBlogPosts}</p>
          <p>Đã duyệt: {stats.approvedBlogPosts}</p>
          <p>Đã từ chối: {stats.rejectedBlogPosts}</p>
        </div>

        <div className="stat-card">
          <h3>Bảo trì</h3>
          <p>Tổng số: {stats.totalMaintenanceRequests}</p>
          <p>Đang chờ: {stats.pendingMaintenanceRequests}</p>
          <p>Đã duyệt: {stats.approvedMaintenanceRequests}</p>
          <p>Đã hoàn thành: {stats.completedMaintenanceRequests}</p>
          <p>Đã hủy: {stats.cancelledMaintenanceRequests}</p>
        </div>
      </div>
      
      <div className="detailed-statistics">
        <ProjectStatistics />
        <UserStatistics />
        <DesignStatistics />
        <BlogStatistics />
        <RevenueStatistics 
          revenueData={{
            totalRevenue: stats.totalRevenue,
            revenueChartData: stats.revenueChartData
          }} 
        />
        <MaintenanceStatistics />
      </div>
    </div>
  );
};

export default Statistics;
