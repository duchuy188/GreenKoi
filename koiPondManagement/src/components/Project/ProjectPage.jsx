import React from 'react';
import listProject from '../Share/listproject';
import { Link } from 'react-router-dom';
import './Project.css';

export default function ProjectPage() {
  return (
    <div className="project-container">
      {listProject.map((project) => (
        <div key={project.id} className="project-card">
          <Link to={`/duan/${project.id}`} className="project-link">
            <div className="project-image-container">
              <img src={project.image} alt={project.name} className="project-image" />
              <div className="project-overlay">
                <h2 className="project-title">{project.name}</h2>
                <p className="project-description">{project.description}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}