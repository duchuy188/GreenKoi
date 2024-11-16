import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './BlogStatistics.css';

// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BlogStatistics = () => {
  const [blogStats, setBlogStats] = useState({
    totalBlogPosts: 0,
    draftBlogPosts: 0,
    approvedBlogPosts: 0,
    rejectedBlogPosts: 0
  });

  useEffect(() => {
    const fetchBlogStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/blog-stats');
        console.log('Blog Statistics Response:', response.data); 
        setBlogStats(response.data);
      } catch (error) {
        console.error('Error fetching blog statistics:', error);
      }
    };

    fetchBlogStats();
  }, []);

  const chartData = {
    labels: ['Tổng số bài viết', 'Bản nháp', 'Đã duyệt', 'Đã từ chối'],
    datasets: [
      {
        label: 'Số lượng bài viết',
        data: [
          blogStats.totalBlogPosts,
          blogStats.draftBlogPosts,
          blogStats.approvedBlogPosts,
          blogStats.rejectedBlogPosts
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Thống kê Blog',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="blog-statistics">
      <h2>Thống kê Blog</h2>
      <div className="blog-chart">
        <Bar data={chartData} options={chartOptions} />
      </div>
      {/* <div className="blog-stats-grid">
        <div className="blog-stat-item">
          <h3>Tổng số bài viết</h3>
          <div className="stat-value">{blogStats.totalBlogPosts}</div>
        </div>
        <div className="blog-stat-item">
          <h3>Bản nháp</h3>
          <div className="stat-value">{blogStats.draftBlogPosts}</div>
        </div>
        <div className="blog-stat-item">
          <h3>Đã duyệt</h3>
          <div className="stat-value">{blogStats.approvedBlogPosts}</div>
        </div>
        <div className="blog-stat-item">
          <h3>Đã từ chối</h3>
          <div className="stat-value">{blogStats.rejectedBlogPosts}</div>
        </div>
      </div> */}
    </div>
  );
};

export default BlogStatistics; 