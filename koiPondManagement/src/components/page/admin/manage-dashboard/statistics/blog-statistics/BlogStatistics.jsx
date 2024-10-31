import { useEffect, useState } from 'react';
import axios from '../../../../../config/axios';
import './BlogStatistics.css';

const BlogStatistics = () => {
  const [blogStats, setBlogStats] = useState({
    totalBlogPosts: 0,
    pendingApprovalBlogPosts: 0,
    approvedBlogPosts: 0,
    rejectedBlogPosts: 0
  });

  useEffect(() => {
    const fetchBlogStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/blog-stats');
        setBlogStats(response.data);
      } catch (error) {
        console.error('Error fetching blog statistics:', error);
      }
    };

    fetchBlogStats();
  }, []);

  return (
    <div className="blog-statistics">
      <h2>Thống kê Blog</h2>
      <div className="blog-stats-grid">
        <div className="blog-stat-item">
          <h3>Tổng số bài viết</h3>
          <div className="stat-value">{blogStats.totalBlogPosts}</div>
        </div>
        <div className="blog-stat-item">
          <h3>Đang chờ duyệt</h3>
          <div className="stat-value">{blogStats.pendingApprovalBlogPosts}</div>
        </div>
        <div className="blog-stat-item">
          <h3>Đã duyệt</h3>
          <div className="stat-value">{blogStats.approvedBlogPosts}</div>
        </div>
        <div className="blog-stat-item">
          <h3>Đã từ chối</h3>
          <div className="stat-value">{blogStats.rejectedBlogPosts}</div>
        </div>
      </div>
    </div>
  );
};

export default BlogStatistics; 