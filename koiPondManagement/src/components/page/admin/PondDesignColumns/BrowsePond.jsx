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
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await api.get("/api/blog/posts/pending");
      setPosts(response.data);
    } catch (err) {
      message.error(
        "Không thể lấy bài viết blog đang chờ: " +
          (err.response?.data?.message || err.message)
      );
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
      message.error(
        "Không thể lấy bài viết blog đã duyệt: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setPostsLoading(false);
    }
  };

  // Add refresh function
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // Fetch data whenever refreshTrigger changes
    fetchPosts();
    fetchApprovedPosts();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

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
        message.success("Duyệt blog thành công");
      } else if (actionType === "reject") {
        // Sửa lại body request khi reject
        await api.post(`/api/blog/posts/${selectedPost.id}/reject`, {
          reason: rejectReason, // Gửi reason thay vì additionalProps
        });
        message.success("Từ chối blog thành công");
      }
      refreshData();
      setSubmitModalVisible(false);
      setSelectedPost(null);
    } catch (err) {
      message.error(
        `Không thể ${actionType} blog: ` +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/blog/posts/${postId}`);
      message.success("Xóa blog thành công");
      refreshData(); // Trigger refresh after delete
    } catch (err) {
      message.error(
        "Không thể xóa bài viết blog: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleRestorePost = async (postId) => {
    try {
      await api.post(`/api/blog/posts/${postId}/restore`);
      message.success("Khôi phục blog thành công");
      refreshData(); // Trigger refresh after restore
    } catch (err) {
      message.error(
        "Không thể khôi phục bài viết blog: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
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
      key: "status",
      render: (status) => {
        switch (status) {
          case "PENDING_APPROVAL":
            return "Đang chờ xử lý";
          case "APPROVED":
            return "Đã chấp nhận";
          default:
            return status;
        }
      },
    },
    {
      title: "Hoạt Động",
      dataIndex: "active",
      key: "active",
      render: (active) => <Tag>{active ? "Hoạt động" : "Không hoạt động"}</Tag>,
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
          <Button
            type="primary"
            onClick={() => openActionModal(record, "approve")}
          >
            Chấp Nhận
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => openActionModal(record, "reject")}
          >
            Không chấp nhận
          </Button>
        </>
      ),
    },
  ];

  const approvedColumns = [
    ...columns.slice(0, -1),
    {
      key: "actions",
      render: (text, record) => (
        <div>
          {record.active ? (
            <Button
              type="link"
              danger
              onClick={() => handleDeletePost(record.id)}
            >
              Xóa
            </Button>
          ) : (
            <Button
              type="link"
              className="text-green-500"
              onClick={() => handleRestorePost(record.id)}
            >
              Khôi phục
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1500, margin: "0 0 0 -30px", padding: 24 }}>
      <Card className="mb-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Chờ duyệt Blog </h2>
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
          <h2 className="text-xl font-semibold mb-4"> Quản lý Blog</h2>
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
        title={actionType === "approve" ? "Approve Blog" : "Từ chối"}
        open={submitModalVisible}
        onOk={handleBlogAction}
        onCancel={() => setSubmitModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          disabled: actionType === "reject" && !rejectReason.trim(),
        }}
      >
        {actionType === "reject" && (
          <TextArea
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            required
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
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div dangerouslySetInnerHTML={{ __html: currentContent }} />
        </div>
      </Modal>
    </div>
  );
}

export default BrowsePond;
