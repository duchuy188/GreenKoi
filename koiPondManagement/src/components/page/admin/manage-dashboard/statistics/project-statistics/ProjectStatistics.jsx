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
import './ProjectStatistics.css';

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

const ProjectStatistics = () => {
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0
  });

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/project-stats');
        console.log('Project Statistics Response:', response.data);
        setProjectStats(response.data);
      } catch (error) {
        console.error('Error fetching project statistics:', error);
      }
    };

    fetchProjectStats();
  }, []);

  // Configure pie chart data
  const pieChartData = {
    labels: ['Đang thực hiện', 'Đã hoàn thành'],
    datasets: [{
      data: [projectStats.ongoingProjects, projectStats.completedProjects],
      backgroundColor: ['#36A2EB', '#4BC0C0'],
      borderColor: ['#fff', '#fff'],
      borderWidth: 2,
    }]
  };

  // Configure bar chart data
  const barChartData = {
    labels: ['Tổng số dự án', 'Đang thực hiện', 'Đã hoàn thành'],
    datasets: [{
      label: 'Số lượng dự án',
      data: [
        projectStats.totalProjects,
        projectStats.ongoingProjects,
        projectStats.completedProjects
      ],
      backgroundColor: ['#FF7B7B', '#4A90E2', '#50C6B4'],
      borderRadius: 4,
      maxBarThickness: 20,
      barPercentage: 0.6
    }]
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
        grid: {
          color: '#f5f5f5',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 10,
            family: "'Segoe UI', sans-serif"
          },
          padding: 5,
          stepSize: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10,
            family: "'Segoe UI', sans-serif"
          },
          maxRotation: 0
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    }
  };

  // Thêm cấu hình cho pie chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="project-statistics">
      <h2>Thống kê dự án</h2>
      <div className="project-stats-grid">
        {/* <div className="project-stat-section">
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
        </div> */}
        
        <div className="charts-container">
          <div className="chart-item">
            <h3>Tỷ lệ dự án theo trạng thái</h3>
            <div className="pie-chart">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
          
          <div className="chart-item">
            <div className="bar-chart">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatistics;
