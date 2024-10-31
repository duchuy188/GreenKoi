import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import './ProjectStatistics.css';

const ProjectStatistics = () => {
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    totalUsers: 0,
    customerCount: 0,
    consultantCount: 0,
    designerCount: 0,
    constructorCount: 0,
    totalRevenue: 0,
    revenueChartData: []
  });

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/project-stats');
        setProjectStats(response.data);
      } catch (error) {
        console.error('Error fetching project statistics:', error);
      }
    };

    fetchProjectStats();
  }, []);

  return (
    <div className="project-statistics">
      <h2>Thống kê dự án</h2>
      <div className="project-stats-grid">
        <div className="project-stat-section">
          <h3>Tổng quan dự án</h3>
          <div className="stat-items">
            <div className="stat-item">
              <h4>Tổng số dự án</h4>
              <span>{projectStats.totalProjects}</span>
            </div>
            <div className="stat-item">
              <h4>Đang thực hiện</h4>
              <span>{projectStats.ongoingProjects}</span>
            </div>
            <div className="stat-item">
              <h4>Đã hoàn thành</h4>
              <span>{projectStats.completedProjects}</span>
            </div>
          </div>
        </div>

        <div className="project-stat-section">
          <h3>Thống kê người dùng</h3>
          <div className="stat-items">
            <div className="stat-item">
              <h4>Tổng số người dùng</h4>
              <span>{projectStats.totalUsers}</span>
            </div>
            <div className="stat-item">
              <h4>Khách hàng</h4>
              <span>{projectStats.customerCount}</span>
            </div>
            <div className="stat-item">
              <h4>Tư vấn viên</h4>
              <span>{projectStats.consultantCount}</span>
            </div>
            <div className="stat-item">
              <h4>Thiết kế</h4>
              <span>{projectStats.designerCount}</span>
            </div>
            <div className="stat-item">
              <h4>Thi công</h4>
              <span>{projectStats.constructorCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatistics;
