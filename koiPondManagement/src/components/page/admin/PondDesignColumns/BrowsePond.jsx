import React, { useState, useEffect } from "react";
import { Button, message, Card, Table, Modal, Input, Tag } from "antd";
import api from "../../../config/axios";

const { TextArea } = Input;

function BrowsePond() {
  const [posts, setPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionType, setActionType] = useState("");
  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // API calls và các hàm xử lý giữ nguyên...
  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await api.get("/api/blog/posts/pending");
      setPosts(response.data);
    } catch (err) {
      message.error("Failed to fetch pending blog posts: " + (err.response?.data?.message || err.message));
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchApprovedPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await api.get("/api/blog/posts/approved/all");
      setApprovedPosts(response.data);
    } catch (err) {
      message.error("Failed to fetch approved blog posts: " + (err.response?.data?.message || err.message));
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchApprovedPosts();
  }, []);

  const openActionModal = (post, action) => {
    setSelectedPost(post);
    setActionType(action);
    setRejectReason("");
    setSubmitModalVisible(true);
  };

  const openContentModal = (content) => {
    setCurrentContent(content);
    setIsContentModalVisible(true);
  };

  const handleBlogAction = async () => {
    if (!selectedPost) return;
    try {
      if (actionType === "approve") {
        await api.post(`/api/blog/posts/${selectedPost.id}/approve`);
        message.success("Blog approved successfully");
      } else if (actionType === "reject") {
        await api.post(`/api/blog/posts/${selectedPost.id}/reject`, {
          additionalProp1: rejectReason,
        });
        message.success("Blog rejected successfully");
      }
      await fetchPosts();
      setSubmitModalVisible(false);
      setSelectedPost(null);
    } catch (err) {
      message.error(`Failed to ${actionType} blog: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/blog/posts/${postId}`);
      message.success("Blog deleted successfully");
      await fetchApprovedPosts();
    } catch (err) {
      message.error("Failed to delete blog post: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRestorePost = async (postId) => {
    try {
      await api.post(`/api/blog/posts/${postId}/restore`);
      message.success("Blog restored successfully");
      await fetchApprovedPosts();
    } catch (err) {
      message.error("Failed to restore blog post: " + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tiêu Đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Nội Dung",
      dataIndex: "content",
      key: "content",
      render: (text) => (
        <>
          {text.slice(0, 20)}...
          <Button type="link" onClick={() => openContentModal(text)}>
            Xem thêm
          </Button>
        </>
      ),
    },
    {
      title: "Người tạo",
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status"
    },
    {
      title: "Hoạt Động",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag>
          {active ? 'True' : 'False'}
        </Tag>
      )
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
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

  const approvedColumns = [
    ...columns.slice(0, -1),
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div>
          {record.active ? (
            <Button type="link" danger onClick={() => handleDeletePost(record.id)}>
              Delete
            </Button>
          ) : (
            <Button type="link" className="text-green-500" onClick={() => handleRestorePost(record.id)}>
              Restore
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1500, margin: "0 0 0 -30px", padding: 24 }}>
      <Card className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Quản lý Blog</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Blogs</h2>
          <Table
            columns={columns}
            dataSource={posts}
            rowKey="id"
            loading={postsLoading}
            pagination={{ pageSize: 5 }}
          />
        </div>
      </Card>

      <Card className="mt-8">
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Approved Blogs</h2>
          <Table
            columns={approvedColumns}
            dataSource={approvedPosts}
            rowKey="id"
            loading={postsLoading}
            pagination={{ pageSize: 5 }}
          />
        </div>
      </Card>

      {/* Action confirmation modal */}
      <Modal
        title={actionType === "approve" ? "Approve Blog" : "Reject Blog"}
        open={submitModalVisible}
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
        open={isContentModalVisible}
        onCancel={() => setIsContentModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsContentModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div dangerouslySetInnerHTML={{ __html: currentContent }} />
        </div>
      </Modal>
    </div>
  );
}

export default BrowsePond;