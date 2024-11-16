import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './DesignStatistics.css';

const DesignStatistics = () => {
  const [designStats, setDesignStats] = useState({
    totalDesigns: 0,
    approvedDesigns: 0,
    pendingDesigns: 0,
    rejectedDesigns: 0
  });

  useEffect(() => {
    const fetchDesignStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/design-stats');
        console.log('Design Statistics Response:', response.data);
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
          <div className="chart-container">
            <CircularProgressbar
              value={(designStats.approvedDesigns / designStats.totalDesigns) * 100 || 0}
              text={`${designStats.approvedDesigns}`}
              styles={buildStyles({
                pathColor: '#4CAF50',
                textColor: '#333',
                trailColor: '#eee',
              })}
            />
          </div>
          <p>Đã duyệt</p>
        </div>

        <div className="design-stat-card">
          <div className="chart-container">
            <CircularProgressbar
              value={(designStats.pendingDesigns / designStats.totalDesigns) * 100 || 0}
              text={`${designStats.pendingDesigns}`}
              styles={buildStyles({
                pathColor: '#FFC107',
                textColor: '#333',
                trailColor: '#eee',
              })}
            />
          </div>
          <p>Đang chờ duyệt</p>
        </div>

        <div className="design-stat-card">
          <div className="chart-container">
            <CircularProgressbar
              value={(designStats.rejectedDesigns / designStats.totalDesigns) * 100 || 0}
              text={`${designStats.rejectedDesigns}`}
              styles={buildStyles({
                pathColor: '#F44336',
                textColor: '#333',
                trailColor: '#eee',
              })}
            />
          </div>
          <p>Đã từ chối</p>
        </div>

        <div className="design-stat-card">
          <div className="chart-container">
            <CircularProgressbar
              value={100}
              text={`${designStats.totalDesigns}`}
              styles={buildStyles({
                pathColor: '#2196F3',
                textColor: '#333',
                trailColor: '#eee',
              })}
            />
          </div>
          <p>Tổng số thiết kế</p>
        </div>
      </div>
    </div>
  );
};

export default DesignStatistics; 