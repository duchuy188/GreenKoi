
import React from "react"; 
import { Card, Col, Row, Typography, Layout } from "antd"; 
import listProject from "../Share/listproject";
import { useParams } from "react-router-dom"; 

const { Title, Paragraph, Text } = Typography; 
const { Content } = Layout; 

const ProjectDetails = () => { 
  const { id } = useParams(); // Lấy id từ Blog 
  const project = listProject.find((project) => project.id === parseInt(id)); 

  return ( 
    <Layout style={{ backgroundColor: "#f0f2f5" }}> 
      <Content style={{ position: "relative" }}> 
        <img 
          src={project.image} 
          alt="Garden View" 
          style={{ 
            width: "100%", 
            height: "75vh", 
            objectFit: "cover", 
            marginTop: "-6%", 
          }} 
        /> 
        <div 
          style={{ 
            marginTop: "-15%", 
            position: "absolute", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            textAlign: "center", 
            padding: "20px", 
            borderRadius: "10px", 
          }} 
        > 
          <Title style={{ color: "#FFFFFF" }} level={1}> 
            {project.name} 
          </Title> 
        </div> 

        {/* Nội dung chi tiết dự án */} 
        <Row gutter={[16, 16]} style={{ padding: "50px 0" }}> 
          <Col span={16}> 
            <Card> 
              <Typography> 
                <Title level={2}> 
                  "Người chết chỉ thực sự chết khi họ bị lãng quên" 
                </Title> 
                <Paragraph> 
                  Một ngày hè tháng 6 năm 2023, chúng tôi có cơ hội gặp gỡ một 
                  vị khách đặc biệt, vị khách này đặc biệt không phải vì chị là 
                  người nổi tiếng, yếu nhân, chính trị gia, ... mà đặc biệt bởi 
                  câu chuyện của chị. 
                </Paragraph> 
                <Paragraph> 
                  Chị kể cho chúng tôi nghe về người ông của mình, ông sinh ra 
                  cách đây gần 100 năm tại một làng quê thuộc tỉnh Hà Tĩnh. Bằng 
                  trí thông minh, sự sáng dạ và bản tính cần cù; năm 14 tuổi ông 
                  tốt... 
                </Paragraph> 
              </Typography> 
            </Card> 
          </Col> 
          <Col span={8}> 
            <Card title={project.name}> 
              <Typography> 
                <Paragraph> 
                  <strong>Loại: {project.type}</strong>
                </Paragraph> 
                <Paragraph> 
                  <strong>Kích Thước: {project.size}</strong>
                </Paragraph> 
                <Paragraph> 
                  <strong>Địa Điểm: {project.location}</strong>
                </Paragraph> 
                <Paragraph> 
                  <strong>Giá: {project.price}</strong>
                </Paragraph> 
                <Paragraph> 
                  <strong>Thời Gian Thi Công: {project.construction_time}</strong> 
                </Paragraph> 
                <Paragraph> 
                  <strong>Vật liệu sử dụng: {project.materials_used}</strong>
                </Paragraph> 
                <Paragraph> 
                  <strong>Đặc điểm nước: {project.water_feature}</strong> 
                </Paragraph> 
                <Paragraph> 
                  <strong>Đánh giá: {project.rating}/5</strong> 
                </Paragraph>
              </Typography> 
            </Card> 
          </Col> 
        </Row> 
      </Content> 
    </Layout> 
  ); 
}; 

export default ProjectDetails;

// import { listProject } from '../Share/listproject'
// import { useParams } from 'react-router-dom'
// import './Detail.css'

// export default function Detail() {
//     const { id } = useParams()
//     const project = listProject.find(project => project.id === parseInt(id))

//     if (!project) {
//         return <div className="not-found">Project not found</div>
//     }

//     return (
//         <div className="detail-page">

//             <div className="detail-content">
//                 <div className="detail-image">
//                     <img src={project.image} alt={project.name} />
//                 </div>
//                 <div className="detail-info">
//                     <p className="description">{project.description}</p>
//                     <div className="info-grid">
                       
//                         <div className="info-item">
//                             <span className="label">Name:</span>
//                             <span className="value">{project.name}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Rating:</span>
//                             <span className="value">{project.rating}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Type:</span>
//                             <span className="value">{project.type}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Size:</span>
//                             <span className="value">{project.size}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Location:</span>
//                             <span className="value">{project.location}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Price:</span>
//                             <span className="value">{project.price}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Construction Time:</span>
//                             <span className="value">{project.construction_time}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Materials Used:</span>
//                             <span className="value">{project.materials_used}</span>
//                         </div>
//                         <div className="info-item">
//                             <span className="label">Water Feature:</span>
//                             <span className="value">{project.water_feature}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }