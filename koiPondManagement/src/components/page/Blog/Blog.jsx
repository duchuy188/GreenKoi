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
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const Blog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await api.get(`/api/blog/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post details:", error);
        message.error("Failed to load post details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

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
        message.error("You must be logged in to submit a request.");
        navigate("/login");
        return;
      }

      const consultationRequest = {
        designId: id,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerAddress: values.customerAddress,
        designName: post.title,
        designDescription: post.content,
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
        navigate("/login");
      } else {
        message.error(
          "Failed to submit consultation request. Please try again."
        );
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  return (
    <Layout style={{ backgroundColor: "#f0f2f5" }}>
      <Content style={{ position: "relative" }}>
        <img
          src={post.coverImageUrl}
          alt={post.title}
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
            {post.title}
          </Title>
        </div>

        {/* Nội dung chi tiết bài viết */}
        <Row gutter={[16, 16]} style={{ padding: "50px 0" }}>
          <Col span={16}>
            <Card>
              <Typography>
                <Title level={2}>Nội dung bài viết</Title>
                <Paragraph>{post.content}</Paragraph>
                <Paragraph>
                  <strong>
                    Ngày xuất bản:{" "}
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </strong>
                </Paragraph>
              </Typography>
            </Card>
          </Col>
          <Col span={8}>
            <Card title={post.title}>
              <Paragraph>
                <strong>
                  Ngày xuất bản:{" "}
                  {new Date(post.publishedAt).toLocaleDateString()}
                </strong>
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Blog;
