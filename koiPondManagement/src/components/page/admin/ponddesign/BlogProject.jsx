import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Table,
  Tooltip,
  Popconfirm,
  Modal,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { BsUpload } from "react-icons/bs"; // Import biểu tượng upload

const { Search } = Input;
const { Option } = Select;

function BlogProject() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [blogData, setBlogData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch pending blog posts
  const fetchPendingBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/blog/posts/my");
      setPendingBlogs(response.data);
    } catch (err) {
      console.error("Error fetching pending blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBlogs();
  }, []);

  // Handle form submission (create or update)
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (blogData) {
        await api.put(`/api/blog/drafts/${blogData.id}`, values);
        message.success("Blog post updated successfully");
        setBlogData(null);
        setIsEditModalVisible(false);
      } else {
        message.error("Cannot create a new blog post. Only updates are allowed.");
      }

      form.resetFields();
      fetchPendingBlogs();
    } catch (err) {
      message.error("Failed to update blog post: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle delete draft blog post
  const handleDeleteDraft = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/blog/drafts/${id}`); // Xóa bản nháp
      message.success("Bản nháp đã được xóa thành công");
      fetchPendingBlogs(); // Làm mới danh sách bài viết
    } catch (err) {
      message.error("Xóa bản nháp không thành công: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle delete blog post
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/blog/posts/${id}`);
      message.success("Blog post deleted successfully");
      fetchPendingBlogs();
    } catch (err) {
      message.error("Failed to delete blog post: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle showing description modal
  const showDescriptionModal = (description) => {
    setCurrentDescription(description);
    setIsDescriptionModalVisible(true);
  };

  // Show edit modal
  const showEditModal = (blog) => {
    setBlogData(blog);
    form.setFieldsValue(blog);  // Set current blog data in the form for editing
    setIsEditModalVisible(true);
  };

  // Close edit modal
  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    form.resetFields();  // Reset form when modal is closed
  };

  // Handle submitting the blog draft
  const handleSubmitDraft = async (id) => {
    try {
      setLoading(true);
      await api.post(`/api/blog/drafts/${id}/submit`);
      message.success("Blog draft submitted successfully");
      fetchPendingBlogs();
    } catch (err) {
      message.error("Failed to submit blog draft: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const time = date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const formattedDate = date.toISOString().split('T')[0];
    return `${time}\n${formattedDate}`;
  };

  // Filter pending blogs based on search text and status filter
  const filteredBlogs = pendingBlogs.filter(
    (blog) =>
      (statusFilter === "ALL" || blog.status === statusFilter) &&
      (blog.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.id?.toString().includes(searchText))
  );

  // Updated columns definition
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Content", dataIndex: "content", key: "content" },
    { title: "Author Id", dataIndex: "authorId", key: "authorId" },
    { title: "ImageUrl", dataIndex: "coverImageUrl", key: "coverImageUrl" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span style={{ whiteSpace: 'pre-line' }}>
          {formatDateTime(text)}
        </span>
      )
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => (
        <span style={{ whiteSpace: 'pre-line' }}>
          {formatDateTime(text)}
        </span>
      )
    },
    {
      title: "Published At",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (text) => (
        text ? (
          <span style={{ whiteSpace: 'pre-line' }}>
            {formatDateTime(text)}
          </span>
        ) : null
      )
    },
    { title: "Rejection Reason", dataIndex: "rejectionReason", key: "rejectionReason" },
    {
      key: "action",
      width: 150,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Tooltip title="Chỉnh sửa">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => showEditModal(record)}  // Open modal with blog data
            >
              <FaEdit />
            </Button>
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bản nháp này không?"
            onConfirm={() => handleDeleteDraft(record.id)} // Xóa bản nháp
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa bản nháp">
              <Button variant="ghost" size="icon">
                <RiDeleteBin2Fill />
              </Button>
            </Tooltip>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc chắn muốn gửi bài viết này không?"
            onConfirm={() => handleSubmitDraft(record.id)} // Submit draft
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Gửi bài viết">
              <Button variant="ghost" size="icon">
                <BsUpload />
              </Button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1550, margin: "0 auto", padding: 24 }}>
      <Card>
        <h1>QUẢN LÝ BÀI VIẾT BLOG</h1>
        <Search
          placeholder="Tìm kiếm bài viết"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 200, marginLeft: 16 }}
        >
          <Option value="ALL">Tất cả</Option>
          <Option value="PENDING_APPROVAL">Chờ duyệt</Option>
          <Option value="APPROVED">Đã duyệt</Option>
          <Option value="REJECTED">Bị từ chối</Option>
          <Option value="DRAFT">Bản nháp</Option>
        </Select>
        <Table
          columns={columns}
          dataSource={filteredBlogs}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa bài viết"
        visible={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={[
          <Button key="cancel" onClick={handleEditModalClose}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Tiêu đề">
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Nội dung">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="coverImageUrl" label="Hình ảnh">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Description Modal */}
      <Modal
        title="Mô tả"
        visible={isDescriptionModalVisible}
        onCancel={() => setIsDescriptionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDescriptionModalVisible(false)}>
            Hủy
          </Button>,
        ]}
      >
        <p>{currentDescription}</p>
      </Modal>
    </div>
  );
}

export default BlogProject;
