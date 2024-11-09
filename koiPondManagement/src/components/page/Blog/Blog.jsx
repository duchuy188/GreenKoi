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
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../config/axios";
import { toast } from "react-toastify";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const Blog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
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
        toast.error("Không thể tải chi tiết bài viết. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestPosts = async () => {
      try {
        const response = await api.get("/api/blog/posts/approved");
        const sortedPosts = response.data
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 5);
        setLatestPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching latest posts:", error);
        toast.error("Không thể tải bài viết mới nhất. Vui lòng thử lại.");
      }
    };

    fetchPostDetails();
    fetchLatestPosts();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  return (
    <Layout style={{ backgroundColor: "#f0f2f5" }}>
      <Content>
        <div style={{ position: "relative" }}>
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              style={{
                width: "100%",
                height: "400px",
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
              {post.title}
            </Title>
          </div>
        </div>

        <Row gutter={[16, 16]} style={{ padding: "50px 0" }}>
          <Col span={16}>
            <Card>
              <Typography>
                <Title level={2}>Nội dung bài viết</Title>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                <Paragraph>
                  <strong>Ngày xuất bản:</strong>{" "}
                  {new Intl.DateTimeFormat("vi-VN").format(
                    new Date(post.publishedAt)
                  )}
                </Paragraph>
              </Typography>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Title level={3}>Bài viết mới nhất</Title>
              {latestPosts.map((latestPost) => (
                <Col span={24} style={{ paddingLeft: 8 }} key={latestPost.id}>
                  <Link
                    to={`/blog/${latestPost.id}`}
                    className="project-card"
                    style={{ textDecoration: "none" }}
                  >
                    {latestPost.coverImageUrl && (
                      <img
                        src={latestPost.coverImageUrl}
                        alt={latestPost.title}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          marginBottom: 8,
                        }}
                      />
                    )}
                    <Paragraph style={{ marginBottom: 4, marginTop: 10 }}>
                      <strong>{latestPost.title}</strong>
                    </Paragraph>
                  </Link>
                  <small style={{ color: "inherit" }}>
                    {new Intl.DateTimeFormat("vi-VN").format(
                      new Date(latestPost.publishedAt)
                    )}
                  </small>
                </Col>
              ))}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Blog;
