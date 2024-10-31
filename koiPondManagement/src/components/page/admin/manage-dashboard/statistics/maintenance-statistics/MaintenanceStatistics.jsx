import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import './MaintenanceStatistics.css';

const MaintenanceStatistics = () => {
  const [maintenanceStats, setMaintenanceStats] = useState({
    totalMaintenanceRequests: 0,
    pendingMaintenanceRequests: 0,
    inProgressMaintenanceRequests: 0,
    completedMaintenanceRequests: 0,
    cancelledMaintenanceRequests: 0,
    totalBlogPosts: 0,
    pendingBlogPosts: 0,
    approvedBlogPosts: 0,
    rejectedBlogPosts: 0,
    totalDesigns: 0,
    pendingDesigns: 0,
    approvedDesigns: 0,
    rejectedDesigns: 0
  });

  useEffect(() => {
    const fetchMaintenanceStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/maintenance-stats');
        setMaintenanceStats(response.data);
      } catch (error) {
        console.error('Error fetching maintenance statistics:', error);
      }
    };

    fetchMaintenanceStats();
  }, []);

  return (
    <div className="maintenance-statistics">
      <h2>Thống kê bảo trì</h2>
      <div className="maintenance-stats-grid">
        <div className="maintenance-stat-section">
          <h3>Yêu cầu bảo trì</h3>
          <div className="stat-items">
            <div className="stat-item">
              <h4>Tổng số yêu cầu</h4>
              <span>{maintenanceStats.totalMaintenanceRequests}</span>
            </div>
            <div className="stat-item">
              <h4>Đang chờ duyệt</h4>
              <span>{maintenanceStats.pendingMaintenanceRequests}</span>
            </div>
            <div className="stat-item">
              <h4>Đang thực hiện</h4>
              <span>{maintenanceStats.inProgressMaintenanceRequests}</span>
            </div>
            <div className="stat-item">
              <h4>Đã hoàn thành</h4>
              <span>{maintenanceStats.completedMaintenanceRequests}</span>
            </div>
            <div className="stat-item">
              <h4>Đã hủy</h4>
              <span>{maintenanceStats.cancelledMaintenanceRequests}</span>
            </div>
          </div>
        </div>

        <div className="maintenance-stat-section">
          <h3>Thống kê bài viết</h3>
          <div className="stat-items">
            <div className="stat-item">
              <h4>Tổng số bài viết</h4>
              <span>{maintenanceStats.totalBlogPosts}</span>
            </div>
            <div className="stat-item">
              <h4>Chờ duyệt</h4>
              <span>{maintenanceStats.pendingBlogPosts}</span>
            </div>
            <div className="stat-item">
              <h4>Đã duyệt</h4>
              <span>{maintenanceStats.approvedBlogPosts}</span>
            </div>
            <div className="stat-item">
              <h4>Đã từ chối</h4>
              <span>{maintenanceStats.rejectedBlogPosts}</span>
            </div>
          </div>
        </div>

        <div className="maintenance-stat-section">
          <h3>Thống kê thiết kế</h3>
          <div className="stat-items">
            <div className="stat-item">
              <h4>Tổng số thiết kế</h4>
              <span>{maintenanceStats.totalDesigns}</span>
            </div>
            <div className="stat-item">
              <h4>Chờ duyệt</h4>
              <span>{maintenanceStats.pendingDesigns}</span>
            </div>
            <div className="stat-item">
              <h4>Đã duyệt</h4>
              <span>{maintenanceStats.approvedDesigns}</span>
            </div>
            <div className="stat-item">
              <h4>Đã từ chối</h4>
              <span>{maintenanceStats.rejectedDesigns}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceStatistics; 