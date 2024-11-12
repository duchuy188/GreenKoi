import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Table,
  Modal,
  Input,
  Tag,
  Popconfirm,
  Select,
  Image,
} from "antd";
import { toast } from "react-toastify";
import api from "../../../config/axios";

const { TextArea } = Input;

function BrowsePond() {
  const [posts, setPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Add back these states for reject modal
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  // Thêm state mới cho filter
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await api.get("/api/blog/posts/pending");
      setPosts(response.data);
    } catch (err) {
      toast.error(
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
      toast.error(
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

  const openContentModal = (content) => {
    setCurrentContent(content);
    setIsContentModalVisible(true);
  };

  // Add function to open reject modal
  const openRejectModal = (post) => {
    setSelectedPost(post);
    setRejectReason("");
    setSubmitModalVisible(true);
  };

  // Modify handleBlogAction for reject case
  const handleBlogAction = async (post, action, reason = "") => {
    try {
      if (action === "approve") {
        await api.post(`/api/blog/posts/${post.id}/approve`);
        toast.success("Duyệt blog thành công");
      } else if (action === "reject") {
        await api.post(`/api/blog/posts/${selectedPost.id}/reject`, {
          reason: rejectReason,
        });
        toast.success("Từ chối blog thành công");
        setSubmitModalVisible(false);
      }
      refreshData();
    } catch (err) {
      toast.error(
        `Không thể ${action} blog: ` +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/blog/posts/${postId}`);
      toast.success("Ẩn bài viết thành công", {
        toastId: "deletePost",
        position: "top-right",
        autoClose: 2000,
      });
      refreshData();
    } catch (err) {
      toast.error(
        "Không thể xóa bài viết blog: " +
          (err.response?.data?.message || err.message),
        {
          toastId: "deletePostError",
        }
      );
    }
  };

  const handleRestorePost = async (postId) => {
    try {
      await api.post(`/api/blog/posts/${postId}/restore`);
      toast.success("Khôi phục blog thành công", {
        toastId: "restorePost",
        position: "top-right",
        autoClose: 2000,
      });
      refreshData();
    } catch (err) {
      toast.error(
        "Không thể khôi phục bài viết blog: " +
          (err.response?.data?.message || err.message),
        {
          toastId: "restorePostError",
        }
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
        <Button type="link" onClick={() => openContentModal(text)}>
          Xem thêm
        </Button>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "coverImageUrl",
      key: "coverImageUrl",
      render: (url) => (
        <Image
          src={url}
          alt="Pond Design"
          width={100}
          height={100}
          style={{ objectFit: "cover", marginTop: "5px" }}
          placeholder={
            <div
              style={{
                width: 100,
                height: 100,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f5f5f5",
              }}
            >
              Loading...
            </div>
          }
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;
        switch (status) {
          case "PENDING_APPROVAL":
            color = "gold";
            text = "Đang chờ xử lý";
            break;
          case "APPROVED":
            color = "green";
            text = "Đã chấp nhận";
            break;
          default:
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hoạt Động",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active ? "blue" : "red"}>
          {active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
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
      title: "Thời gian xuất bản",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (text, record) => {
        if (record.status === "PENDING_APPROVAL") {
          return "Chưa xuất bản";
        }
        return text ? new Date(text).toLocaleString() : "-";
      },
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (text, record) => (
        <>
          <Popconfirm
            title="Xác nhận"
            description="Bạn có chấp nhận thiết kế blog này không?"
            onConfirm={() => handleBlogAction(record, "approve")}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="link" className="text-blue-500">
              Chấp Nhận
            </Button>
          </Popconfirm>
          <Button
            type="link"
            style={{ color: "#ff4d4f" }}
            onClick={() => openRejectModal(record)}
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
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (text, record) => (
        <div>
          {record.active ? (
            <Button
              type="link"
              danger
              onClick={() => handleDeletePost(record.id)}
            >
              Ẩn bài viết
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

  // Thêm hàm lọc data
  const getFilteredApprovedPosts = () => {
    switch (activeFilter) {
      case "active":
        return approvedPosts.filter((post) => post.active);
      case "inactive":
        return approvedPosts.filter((post) => !post.active);
      default:
        return approvedPosts;
    }
  };

  return (
    <div style={{ maxWidth: 1500, margin: "0 0 0 -30px", padding: 24 }}>
      <Card className="mb-8">
        <div className="mb-8">
          <h1>Chờ duyệt Blog</h1>
          <Table
            columns={columns}
            dataSource={posts}
            rowKey="id"
            loading={postsLoading}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1500 }}
          />
        </div>
      </Card>

      <Card className="mt-8">
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h1>Quản lý Blog</h1>
            <Select
              defaultValue="all"
              style={{ width: 200 }}
              onChange={(value) => setActiveFilter(value)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang hoạt động" },
                { value: "inactive", label: "Không hoạt động" },
              ]}
            />
          </div>
          <Table
            columns={approvedColumns}
            dataSource={getFilteredApprovedPosts()}
            rowKey="id"
            loading={postsLoading}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1500 }}
          />
        </div>
      </Card>

      {/* Add back the reject modal */}
      <Modal
        title="Từ chối"
        open={submitModalVisible}
        onOk={() => handleBlogAction(selectedPost, "reject")}
        onCancel={() => setSubmitModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          disabled: !rejectReason.trim(),
        }}
      >
        <TextArea
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          required
        />
      </Modal>

      {/* Content modal */}
      <Modal
        title="Nội dung blog"
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
