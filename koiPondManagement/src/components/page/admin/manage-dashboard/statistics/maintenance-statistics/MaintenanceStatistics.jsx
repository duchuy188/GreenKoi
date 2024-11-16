import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './MaintenanceStatistics.css';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MaintenanceStatistics = () => {
  const [maintenanceStats, setMaintenanceStats] = useState({
    totalMaintenanceRequests: 0,
    pendingMaintenanceRequests: 0,
    completedMaintenanceRequests: 0,
    cancelledMaintenanceRequests: 0
  });

  useEffect(() => {
    const fetchMaintenanceStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/maintenance-stats');
        console.log('Maintenance Statistics Response:', response.data);
        setMaintenanceStats(response.data);
      } catch (error) {
        console.error('Error fetching maintenance statistics:', error);
      }
    };

    fetchMaintenanceStats();
  }, []);

  // Prepare data for Pie Chart
  const pieChartData = {
    labels: ['Đang chờ duyệt', 'Đang thực hiện', 'Đã hoàn thành', 'Đã hủy'],
    datasets: [{
      data: [
        maintenanceStats.pendingMaintenanceRequests,
        maintenanceStats.inProgressMaintenanceRequests,
        maintenanceStats.completedMaintenanceRequests,
        maintenanceStats.cancelledMaintenanceRequests,
      ],
      backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#EF5350'],
    }],
  };

  // Prepare data for Bar Chart
  const barChartData = {
    labels: ['Tổng số', 'Đang chờ duyệt', 'Đang thực hiện', 'Đã hoàn thành', 'Đã hủy'],
    datasets: [{
      label: 'Số lượng yêu cầu',
      data: [
        maintenanceStats.totalMaintenanceRequests,
        maintenanceStats.pendingMaintenanceRequests,
        maintenanceStats.inProgressMaintenanceRequests,
        maintenanceStats.completedMaintenanceRequests,
        maintenanceStats.cancelledMaintenanceRequests,
      ],
      backgroundColor: '#2196f3',
    }],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          padding: 8,
          font: {
            size: 9
          }
        }
      }
    },
    cutout: '60%'
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 8
          }
        },
        grid: {
          display: false
        }
      },
      x: {
        ticks: {
          font: {
            size: 8
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="maintenance-statistics">
      <h2>THỐNG KÊ BẢO TRÌ</h2>
      <div className="maintenance-stats-grid">
        <div className="charts-container">
          <div className="chart-item">
            <h3>Tỷ lệ yêu cầu bảo trì theo trạng thái</h3>
            <div className="pie-chart">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
          
          <div className="chart-item">
            <h3>Số lượng yêu cầu bảo trì</h3>
            <div className="bar-chart">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceStatistics; 