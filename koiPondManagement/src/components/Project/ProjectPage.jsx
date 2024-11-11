import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/axios';
import './Project.css';

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchPublicPondDesigns = async () => {
    try {
      const response = await api.get("/api/pond-designs/public");
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        toast.error("Không tải được các thiết kế công khai."); 
        setProjects([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi khi tải các thiết kế công khai.");  
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchPublicPondDesigns();
  }, []);

  const handleProjectClick = (e, projectId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.warning("Vui lòng đăng nhập để xem chi tiết dự án");
      navigate('/duan');
      return;
    }
    navigate(`/duan/${projectId}`);
  };

  return (
    <div className="project-gallery">
      {projects.map((project) => (
        <div
          key={project.id}
          className="project-card"
          onClick={(e) => handleProjectClick(e, project.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="project-image-container">
            <img src={project.imageUrl} alt={project.name} className="project-image" />
            <div className="project-overlay">
              <h2 className="project-title" style={{ color: "white" }}>{project.name}</h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
