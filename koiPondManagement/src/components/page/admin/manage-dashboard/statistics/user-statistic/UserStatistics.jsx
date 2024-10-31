import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import './UserStatistics.css';

const UserStatistics = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    customerCount: 0,
    designerCount: 0,
    constructorCount: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/user-stats');
        setUserStats(response.data);
      } catch (error) {
        console.error('Error fetching user statistics:', error);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="user-statistics">
      {/* Thống kê tổng quan */}
      <div className="stat-overview">
        <div className="stat-card">
          <h3>Người dùng</h3>
          <p>Tổng số: {userStats.totalUsers}</p>
          <p>Khách hàng: {userStats.customerCount}</p>
          <p>Thiết kế: {userStats.designerCount}</p>
          <p>Thi công: {userStats.constructorCount}</p>
        </div>
      </div>

      {/* Biểu đồ phân bố */}
      <div className="stat-charts">
        {/* Biểu đồ cột theo độ tuổi */}
        <div className="chart age-distribution">
          <h3>Phân bố theo độ tuổi</h3>
          <div className="bar-chart">
            <div className="bar-group">
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
              <div className="bar-item"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
