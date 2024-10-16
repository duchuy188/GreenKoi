import React, { useState, useEffect } from "react";
import { Button, message, Card, Table, Modal } from "antd";
import api from "../../../config/axios";

function BrowsePond() {
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionType, setActionType] = useState(""); // Store action type ("approve" or "reject")

  // Fetch blog posts
  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await api.get("/api/blog/posts/pending");
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

  // Open modal to confirm action (approve or reject)
  const openActionModal = (post, action) => {
    setSelectedPost(post);
    setActionType(action); // Set action type
    setSubmitModalVisible(true);
  };

  // Handle blog approval or rejection
  const handleBlogAction = async () => {
    if (!selectedPost) return;
    try {
      if (actionType === "approve") {
        await api.post(`/api/blog/posts/${selectedPost.id}/approve`);
        message.success("Blog approved successfully");
      } else if (actionType === "reject") {
        await api.post(`/api/blog/posts/${selectedPost.id}/reject`);
        message.success("Blog rejected successfully");
      }
      fetchPosts(); // Refresh posts after action
      setSubmitModalVisible(false);
      setSelectedPost(null);
    } catch (err) {
      message.error(`Failed to ${actionType} blog: ` + (err.response?.data?.message || err.message));
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
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => openActionModal(record, "approve")}>
            Approve
          </Button>
          <Button type="link" onClick={() => openActionModal(record, "reject")}>
            Reject
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
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

      {/* Action confirmation modal */}
      <Modal
        title={actionType === "approve" ? "Approve Blog" : "Reject Blog"}
        visible={submitModalVisible}
        onOk={handleBlogAction}
        onCancel={() => setSubmitModalVisible(false)}
      >
        <p>Are you sure you want to {actionType} this blog?</p>
      </Modal>
    </div>
  );
}

export default BrowsePond;
