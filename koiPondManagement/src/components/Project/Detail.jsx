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
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/axios";
import { toast } from "react-toastify";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await api.get(`/api/pond-designs/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast.error("Không thể tải thông tin dự án. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await api.get("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (isModalVisible && project && userProfile) {
      form.setFieldsValue({
        customerName: userProfile.fullName || "",
        customerPhone: userProfile.phone || "",
        customerAddress: userProfile.address || "",
        designName: project.name || "",
        notes: "",
      });
    }
  }, [isModalVisible, project, userProfile, form]);

  const showModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Modal.confirm({
        title: "Đăng nhập",
        content: "Bạn cần đăng nhập để gửi yêu cầu",
        okText: "Ok",
        cancelText: "Hủy",
        onOk: () => navigate("/login"),
      });
    } else {
      setIsModalVisible(true);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để gửi yêu cầu tư vấn.");
        navigate("/login");
        return;
      }

      const consultationRequest = {
        designId: id,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerAddress: values.customerAddress,
        designName: project.name,
        designDescription: project.description,
        notes: values.notes,
      };

      const response = await api.post(
        "/api/ConsultationRequests",
        consultationRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Yêu cầu tư vấn đã được gửi thành công!");
        setIsModalVisible(false);
        form.resetFields();
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        toast.error("Không thể gửi yêu cầu tư vấn. Vui lòng thử lại.");
      }
    }
  };

  const handleConsultationRequest = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Modal.confirm({
        title: "Đăng nhập",
        content: "Bạn cần đăng nhập để gửi yêu cầu",
        okText: "Ok",
        cancelText: "Hủy",
        onOk: () => navigate("/login"),
      });
    } else {
      setIsModalVisible(true);
    }
  };

  if (loading) {
    return <p>Đang tải...</p>;
  }

  if (!project) {
    return <p>Không tìm thấy dự án</p>;
  }

  return (
    <Layout style={{ backgroundColor: "#f0f2f5" }}>
      <Content>
        <div style={{ position: "relative" }}>
          {project.imageUrl && (
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
          )}
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              padding: "10px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "4px",
              maxWidth: "80%",
            }}
          >
            <Title
              level={1}
              style={{
                color: "#fff",
                textAlign: "center",
                margin: 0,
                fontSize: "2em",
              }}
            >
              {project.name}
            </Title>
          </div>
        </div>

        {/* Nội dung chi tiết dự án */}
        <Row gutter={[16, 16]} style={{ padding: "50px 0" }}>
          <Col span={16}>
            <Card>
              <Typography>
                <Title level={2}>Chi tiết dự án</Title>
                <div
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </Typography>
            </Card>
          </Col>
          <Col span={8}>
            <Card title={project.name}>
              <Typography>
                <Paragraph>
                  <strong>Hình dạng:</strong> {project.shape}
                </Paragraph>
                <Paragraph>
                  <strong>Kích thước:</strong> {project.dimensions}
                </Paragraph>
                <Paragraph>
                  <strong>Đặc điểm:</strong> {project.features}
                </Paragraph>
              </Typography>
              <Button
                type="primary"
                onClick={handleConsultationRequest}
                style={{ marginTop: "20px" }}
              >
                Yêu cầu tư vấn
              </Button>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Yêu cầu tư vấn"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="customerName"
              label="Tên khách hàng"
              rules={[
                { required: true, message: "Vui lòng nhập tên khách hàng" },
              ]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="customerPhone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="customerAddress"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="designName"
              label="Tên dự án"
              rules={[{ required: true, message: "Vui lòng nhập tên dự án" }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Gửi yêu cầu
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ProjectDetails;
