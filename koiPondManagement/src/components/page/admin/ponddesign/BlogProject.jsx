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
import { BsUpload } from "react-icons/bs";

const { Search } = Input;
const { Option } = Select;

function BlogProject() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [blogData, setBlogData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/blog/posts/my");
      setPendingBlogs(response.data.filter(blog => blog.status !== "DRAFT"));
      setDraftBlogs(response.data.filter(blog => blog.status === "DRAFT"));
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const showContentModal = (content, title) => {
    setCurrentContent(content);
    setCurrentTitle(title);
    setIsContentModalVisible(true);
  };

  const showEditModal = (blog) => {
    setBlogData(blog);
    form.setFieldsValue({
      title: blog.title,
      content: blog.content,
      coverImageUrl: blog.coverImageUrl,
    });
    setIsEditModalVisible(true);
  };

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
      fetchBlogs();
    } catch (err) {
      message.error("Failed to update blog post: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/blog/drafts/${id}`);
      message.success("Draft has been deleted successfully");
      fetchBlogs();
    } catch (err) {
      message.error("Failed to delete draft: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    };
  };

  const handleDeletePublished = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/blog/posts/${id}`);
      message.success("Published blog post deleted successfully");
      fetchBlogs();
    } catch (err) {
      message.error("Failed to delete published blog post: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = async (id) => {
    try {
      setLoading(true);
      await api.post(`/api/blog/drafts/${id}/submit`);
      message.success("Blog draft submitted successfully");
      fetchBlogs();
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

  const filteredDrafts = draftBlogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      blog.id?.toString().includes(searchText)
  );

  const filteredPendingBlogs = pendingBlogs.filter(
    (blog) =>
      (statusFilter === "ALL" || blog.status === statusFilter) &&
      (blog.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.id?.toString().includes(searchText))
  );

  const draftColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span>
          {text.slice(0, 5)}...
          <Button 
            type="link" 
            onClick={() => showContentModal(text)} 
            className="text-blue-600 hover:text-blue-800"
          >
            Xem thêm
          </Button>
        </span>
      ),
    },
    {
      title: "Nội dung", 
      dataIndex: "content",
      key: "content",
      render: (text) => (
        <span>
          {text.slice(0, 5)}...
          <Button 
            type="link" 
            onClick={() => showContentModal(text)}
            className="text-blue-600 hover:text-blue-800"
          >
            Xem thêm
          </Button>
        </span>
      ),
    },
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
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => showEditModal(record)}>
            <FaEdit />
          </Button>
          <Popconfirm 
            title="Bạn có chắc chắn muốn xóa?" 
            onConfirm={() => handleDeleteDraft(record.id)}
          >
            <Button type="link" danger>
              <RiDeleteBin2Fill />
            </Button>
          </Popconfirm>
        </>
      )
    }
  ];

  const pendingColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span>
          {text.slice(0, 5)}...
          <Button 
            type="link" 
            onClick={() => showContentModal(text)} 
            className="text-blue-600 hover:text-blue-800"
          >
            Xem thêm
          </Button>
        </span>
      ),
    },
    {
      title: "Nội dung", 
      dataIndex: "content",
      key: "content",
      render: (text) => (
        <span>
          {text.slice(0, 5)}...
          <Button 
            type="link" 
            onClick={() => showContentModal(text)}
            className="text-blue-600 hover:text-blue-800"
          >
            Xem thêm
          </Button>
        </span>
      ),
    },
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
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <>
          <Button 
            type="link" 
            onClick={() => handleSubmitDraft(record.id)}
          >
            <BsUpload />
          </Button>
          <Popconfirm 
            title="Bạn có chắc chắn muốn xóa?" 
            onConfirm={() => handleDeletePublished(record.id)}
          >
            <Button type="link" danger>
              <RiDeleteBin2Fill />
            </Button>
          </Popconfirm>
        </>
      )
    }
  ];

  return (
    <div>
      <h1>Quản lý Blog</h1>
      <Search 
        placeholder="Tìm kiếm..." 
        value={searchText} 
        onChange={(e) => setSearchText(e.target.value)} 
        style={{ width: 200 }} 
      />
      <Table 
        dataSource={filteredDrafts} 
        columns={draftColumns} 
        loading={loading} 
        pagination={false} 
        rowKey="id" 
      />
      <Table 
        dataSource={filteredPendingBlogs} 
        columns={pendingColumns} 
        loading={loading} 
        pagination={false} 
        rowKey="id" 
      />

      {/* Modal for viewing content */}
      <Modal
        title={currentTitle}
        visible={isContentModalVisible}
        onCancel={() => setIsContentModalVisible(false)}
        footer={null}
      >
        <p>{currentContent}</p>
      </Modal>

      {/* Modal for editing draft */}
      <Modal
        title="Chỉnh sửa bài viết"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="coverImageUrl"
            label="URL hình ảnh bìa"
            rules={[{ required: true, message: "Vui lòng nhập URL hình ảnh bìa!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
            <Button onClick={() => setIsEditModalVisible(false)} style={{ marginLeft: 8 }}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default BlogProject;
