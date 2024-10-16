import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Card, Table, Modal } from "antd";
import api from "../../../config/axios";

function BlogManager() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Handle form submission (create or update blog draft)
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingPost) {
        // Update blog draft
        await api.put(`/api/blog/drafts/${editingPost.id}`, values);
        message.success("Blog draft updated successfully");
      } else {
        // Create new blog draft
        await api.post("/api/blog/drafts", values);
        message.success("Blog draft created successfully");
      }
      form.resetFields();
      fetchPosts(); // Refresh posts after creating or updating a draft
      setModalVisible(false);
      setEditingPost(null);
    } catch (err) {
      message.error("Failed to " + (editingPost ? "update" : "create") + " blog draft: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch blog posts
  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await api.get("/api/blog/posts/my");
      setPosts(response.data);
    } catch (err) {
      message.error("Failed to fetch blog posts: " + (err.response?.data?.message || err.message));
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Open modal to edit a blog draft
  const openEditModal = (post) => {
    setEditingPost(post);
    form.setFieldsValue(post); // Set form values to the selected post's data
    setModalVisible(true);
  };

  // Open modal to confirm submitting the blog draft
  const openSubmitModal = (post) => {
    setSelectedPost(post);
    setSubmitModalVisible(true);
  };

  // Handle blog draft submission
  const handleSubmitBlog = async () => {
    if (!selectedPost) return;
    try {
      await api.post(`/api/blog/drafts/${selectedPost.id}/submit`);
      message.success("Blog submitted successfully");
      fetchPosts(); // Refresh posts after submitting
      setSubmitModalVisible(false);
      setSelectedPost(null);
    } catch (err) {
      message.error("Failed to submit blog: " + (err.response?.data?.message || err.message));
    }
  };

  // Define table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "Author ID",
      dataIndex: "authorId",
      key: "authorId",
    },
    {
      title: "Image URL",
      dataIndex: "imageUrl",
      key: "imageUrl",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Published At",
      dataIndex: "publishedAt",
      key: "publishedAt",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Button type="link" onClick={() => openSubmitModal(record)}>
            Submit
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Card title="Create Blog Draft" bordered={false} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter blog content" />
          </Form.Item>

          <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true }]}>
            <Input placeholder="Enter blog image URL" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingPost ? "Update Blog Draft" : "Create Blog Draft"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="My Blog Posts" bordered={false}>
        <Button type="primary" onClick={fetchPosts} loading={postsLoading} style={{ marginBottom: 16 }}>
          Refresh Posts
        </Button>
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={postsLoading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Edit modal */}
      <Modal
        title="Edit Blog Draft"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter blog content" />
          </Form.Item>

          <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true }]}>
            <Input placeholder="Enter blog image URL" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Blog Draft
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Submit confirmation modal */}
      <Modal
        title="Submit Blog"
        visible={submitModalVisible}
        onOk={handleSubmitBlog}
        onCancel={() => setSubmitModalVisible(false)}
      >
        <p>Are you sure you want to submit this blog?</p>
      </Modal>
    </div>
  );
}

export default BlogManager;
