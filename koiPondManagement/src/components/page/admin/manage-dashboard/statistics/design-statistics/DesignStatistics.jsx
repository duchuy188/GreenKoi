import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import './DesignStatistics.css';

const DesignStatistics = () => {
  const [designStats, setDesignStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    totalDesigns: 0,
    pendingDesigns: 0,
    approvedDesigns: 0,
    rejectedDesigns: 0
  });

  useEffect(() => {
    const fetchDesignStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/design-stats');
        setDesignStats(response.data);
      } catch (error) {
        console.error('Error fetching design statistics:', error);
      }
    };

    fetchDesignStats();
  }, []);

  return (
    <div className="design-statistics">
      <h2>Thống kê Thiết kế</h2>
      
      <div className="design-stats-grid">
        <div className="design-stat-card">
          <h3>Dự án Thiết kế</h3>
          <div className="stat-item">
            <span>Tổng số dự án:</span>
            <span>{designStats.totalProjects}</span>
          </div>
          <div className="stat-item">
            <span>Đang thực hiện:</span>
            <span>{designStats.ongoingProjects}</span>
          </div>
          <div className="stat-item">
            <span>Hoàn thành:</span>
            <span>{designStats.completedProjects}</span>
          </div>
        </div>

        <div className="design-stat-card">
          <h3>Trạng thái Thiết kế</h3>
          <div className="stat-item">
            <span>Tổng số thiết kế:</span>
            <span>{designStats.totalDesigns}</span>
          </div>
          <div className="stat-item">
            <span>Đang chờ duyệt:</span>
            <span>{designStats.pendingDesigns}</span>
          </div>
          <div className="stat-item">
            <span>Đã duyệt:</span>
            <span>{designStats.approvedDesigns}</span>
          </div>
          <div className="stat-item">
            <span>Đã từ chối:</span>
            <span>{designStats.rejectedDesigns}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignStatistics; 