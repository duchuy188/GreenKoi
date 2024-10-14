import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Layout,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
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
  const [customerInfo, setCustomerInfo] = useState(null);

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

    const fetchCustomerInfo = async () => {
      try {
        const response = await api.get("/api/profile");
        if (
          response.data &&
          typeof response.data === "object" &&
          !response.data.toString().includes("<!DOCTYPE html>")
        ) {
          console.log("Customer info:", response.data);
          setCustomerInfo(response.data);
        } else {
          throw new Error("Unexpected API response structure");
        }
      } catch (error) {
        console.error("Error fetching customer info:", error);
        message.error(
          "Failed to load customer information. Please log in again."
        );
      }
    };

    fetchProjectDetails();
    fetchCustomerInfo();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!project) {
    return <p>Project not found</p>;
  }

  const onFinish = async (values) => {
    try {
      if (!customerInfo || !customerInfo.id) {
        message.error("Customer information is missing. Please log in again.");
        return;
      }
      const consultationRequest = {
        customerId: customerInfo.id,
        customerName: customerInfo.fullName,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        designId: project.id,
        designName: project.name,
        designDescription: project.description,
        status: "PENDING",
        notes: values.notes,
      };

      console.log("Sending consultation request:", consultationRequest);

      const response = await api.post(
        "/api/ConsultationRequests",
        consultationRequest
      );

      if (response.status === 201 || response.status === 200) {
        message.success("Yêu cầu tư vấn đã được gửi thành công!");
        setIsModalVisible(false);
        form.resetFields();
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      if (error.response && error.response.status === 401) {
        message.error("Unauthorized. Please log in again.");
        // Redirect to login page or refresh token
      } else {
        message.error(
          "Failed to submit consultation request. Please try again."
        );
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const showModal = () => {
    if (!customerInfo) {
      message.error("Please log in to request a consultation.");
      return;
    }
    setIsModalVisible(true);
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
              {customerInfo && (
                <Button
                  type="primary"
                  onClick={showModal}
                  style={{ marginTop: "20px" }}
                >
                  Request Consultation
                </Button>
              )}
            </Card>
          </Col>
        </Row>

        <Modal
          title="Request Consultation"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} onFinish={onFinish} layout="vertical">
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
