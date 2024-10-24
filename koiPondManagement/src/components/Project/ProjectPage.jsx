import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/axios';
import './Project.css';

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);

  const fetchApprovedPondDesigns = async () => {
    try {
      const response = await api.get("/api/pond-designs/approved");
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        toast.error("Không tải được các dự án đã phê duyệt.");
        setProjects([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi khi tải các dự án đã được phê duyệt.");
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchApprovedPondDesigns();
  }, []);

  return (
    <div className="project-gallery">
      {projects.map((project) => (
        <Link to={`/duan/${project.id}`} key={project.id} className="project-card">
          <div className="project-image-container">
            <img src={project.imageUrl} alt={project.name} className="project-image" />
            <div className="project-overlay">
              <h2 className="project-title" style={{ color: "white" }}>{project.name}</h2>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
