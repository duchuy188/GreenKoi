import React from "react";
import { Card, Col, Row, Typography, Layout, List, Space } from "antd";
import { Image } from "antd";
import { Link, useParams } from "react-router-dom";
import ListBlog from "../../Share/listblog";
import "./Blog.css";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const Blog = () => {
  const { id } = useParams();
  const blog = ListBlog.find((blog) => blog.id === parseInt(id));

  const recentPosts = ListBlog.slice(0, 5);

  return (
    <Layout className="blog-layout">
      <Content className="blog-content">
        <img src={blog.img} alt="Garden View" className="blog-hero-image" />
        <div className="blog-hero-overlay">
          <Title style={{color: "white"}} className="blog-hero-title" level={1}>
            {blog.name}
          </Title>
        </div>

        <Row gutter={[16, 16]} className="blog-row">
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
            <Card title="Bài viết mới" className="recent-posts-card">
              <List
                itemLayout="horizontal"
                dataSource={recentPosts}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Image
                          src={item.img}
                          alt={item.name}
                          width={100}
                          height={75}
                          className="recent-post-image"
                          preview={false}
                        />
                      }
                      title={<Link to={`/blog/${item.id}`}>{item.name}</Link>}
                      description={
                        <>
                          <Text type="secondary">{item.description}</Text>
                          <br />
                          <Text type="secondary">{item.date}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Blog;
