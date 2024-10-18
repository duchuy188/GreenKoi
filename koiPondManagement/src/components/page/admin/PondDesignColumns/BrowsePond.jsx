import React, { useState, useEffect } from "react";
import { Button, message, Card, Table, Modal, Input } from "antd";
import api from "../../../config/axios";

const { TextArea } = Input;

function BrowsePond() {
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionType, setActionType] = useState(""); // Store action type ("approve" or "reject")
  const [isContentModalVisible, setIsContentModalVisible] = useState(false); // Modal cho content
  const [currentContent, setCurrentContent] = useState(""); // Nội dung hiện tại cho modal
  const [rejectReason, setRejectReason] = useState(""); // Lưu lý do reject

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
    setRejectReason(""); // Reset reject reason
    setSubmitModalVisible(true);
  };

  // Open content modal
  const openContentModal = (content) => {
    setCurrentContent(content); // Set content
    setIsContentModalVisible(true); // Show modal
  };

  // Handle blog approval or rejection
  const handleBlogAction = async () => {
    if (!selectedPost) return;
    try {
      if (actionType === "approve") {
        await api.post(`/api/blog/posts/${selectedPost.id}/approve`);
        message.success("Blog approved successfully");
      } else if (actionType === "reject") {
        await api.post(`/api/blog/posts/${selectedPost.id}/reject`, {
          additionalProp1: rejectReason, // Gửi lý do từ chối
        });
        message.success("Blog rejected successfully");
      }
      // Refetch posts after action
      await fetchPosts();
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
      render: (text) => (
        <>
          {text.slice(0, 20)}... {/* Hiển thị 20 ký tự đầu tiên */}
          <Button type="link" onClick={() => openContentModal(text)}>
            Xem thêm
          </Button>
        </>
      ),
    },
    {
      title: "Author ID",
      dataIndex: "authorId",
      key: "authorId",
    },
    {
      title: "Hình ảnh",
      dataIndex: "coverImageUrl",
      key: "coverImageUrl",
      render: (url) => (
        <img src={url} alt="Pond Design" style={{ width: 50 }} />
      ),
    },  
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
    <div style={{ maxWidth: 1500, margin: "0 0 0 -30px", padding: 24 }}> {/* Thay đổi margin-left */}
      <Card title="My Blog Posts" bordered={false}>
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
        open={submitModalVisible} // Thay đổi từ visible thành open
        onOk={handleBlogAction}
        onCancel={() => setSubmitModalVisible(false)}
      >
        <p>Are you sure you want to {actionType} this blog?</p>
        {actionType === "reject" && (
          <TextArea
            placeholder="Enter the reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
        )}
      </Modal>

      {/* Content modal */}
      <Modal
        title="Blog Content"
        open={isContentModalVisible} // Thay đổi từ visible thành open
        onCancel={() => setIsContentModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsContentModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Render nội dung với HTML */}
          <div dangerouslySetInnerHTML={{ __html: currentContent }} />
        </div>
      </Modal>
    </div>
  );
}

export default BrowsePond;
