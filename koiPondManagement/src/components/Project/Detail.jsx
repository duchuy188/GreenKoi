import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Layout, Button, Modal, Form, Input, message } from "antd";
import { useParams } from "react-router-dom";
import api from "../config/axios";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ProjectDetails = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [project, setProject] = useState(null); // State lưu thông tin dự án
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await api.get(`/api/pond-designs/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project details:", error);
        if (error.response && error.response.status === 401) {
          message.error("Unauthorized access. Please log in again.");
          // Redirect to login page or refresh token
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!project) {
    return <p>Project not found</p>;
  }

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
      const consultationRequest = {
        designId: id,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerAddress: values.customerAddress,
        designName: project.name,
        designDescription: project.description,
        notes: values.notes,
      };

      const response = await api.post('/api/ConsultationRequests', consultationRequest, {
        headers: {
          'Authorization': `Bearer ${token}` // Include the token in the request header
        }
      });

      if (response.status === 201 || response.status === 200) {
        message.success('Consultation request submitted successfully!');
        setIsModalVisible(false);
        form.resetFields();
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      if (error.response && error.response.status === 401) {
        message.error('Unauthorized. Please log in again.');
        // Redirect to login page or refresh token
      } else {
        message.error('Failed to submit consultation request. Please try again.');
      }
    }
  };

  return (
    <Layout style={{ backgroundColor: "#f0f2f5" }}>
      <Content style={{ position: "relative" }}>
        <img
          src={project.imageUrl}
          alt={project.name}
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
                <Title level={2}>Chi tiết dự án</Title>
                <Paragraph>{project.description}</Paragraph>
              </Typography>
            </Card>
          </Col>
          <Col span={8}>
            <Card title={project.name}>
              <Typography>
                <Paragraph>
                  <strong>Hình dạng: {project.shape}</strong>
                </Paragraph>
                <Paragraph>
                  <strong>Kích thước: {project.dimensions}</strong>
                </Paragraph>
                <Paragraph>
                  <strong>Đặc điểm: {project.features}</strong>
                </Paragraph>
                <Paragraph>
                  <strong>Giá cả: {project.basePrice}</strong>
                </Paragraph>
              </Typography>
              <Button type="primary" onClick={showModal} style={{ marginTop: '20px' }}>
                Request Consultation
              </Button>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Request Consultation"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item name="customerName" label="Your Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="customerPhone" label="Phone Number" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="customerAddress" label="Address" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="notes" label="Additional Notes">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit Request
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ProjectDetails;
