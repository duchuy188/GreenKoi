
import { listProject } from '../Share/listproject'
import { useParams } from 'react-router-dom'
import './Detail.css'

export default function Detail() {
    const { id } = useParams()
    const project = listProject.find(project => project.id === parseInt(id))

    if (!project) {
        return <div className="not-found">Project not found</div>
    }

    return (
        <div className="detail-page">

            <div className="detail-content">
                <div className="detail-image">
                    <img src={project.image} alt={project.name} />
                </div>
                <div className="detail-info">
                    <p className="description">{project.description}</p>
                    <div className="info-grid">
                       
                        <div className="info-item">
                            <span className="label">Name:</span>
                            <span className="value">{project.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Rating:</span>
                            <span className="value">{project.rating}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Type:</span>
                            <span className="value">{project.type}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Size:</span>
                            <span className="value">{project.size}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Location:</span>
                            <span className="value">{project.location}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Price:</span>
                            <span className="value">{project.price}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Construction Time:</span>
                            <span className="value">{project.construction_time}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Materials Used:</span>
                            <span className="value">{project.materials_used}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Water Feature:</span>
                            <span className="value">{project.water_feature}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}