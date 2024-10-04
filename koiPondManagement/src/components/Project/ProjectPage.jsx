
import listProject from '../Share/listproject'
import { Link } from 'react-router-dom'
import './Project.css'

export default function ProjectPage() {
  return (
    <div className="project-container">
      {listProject.map((project) => (
        <div key={project.id} className="project-card">
          <h2>{project.name}</h2>
          <Link to={`/duan/${project.id}`}>
            <img src={project.image} alt={project.name} />
          </Link>
        </div>
      ))}
    </div>
  )
}
