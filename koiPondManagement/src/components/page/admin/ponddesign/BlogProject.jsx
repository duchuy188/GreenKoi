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
  Space,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { BsUpload } from "react-icons/bs";

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

function BlogProject() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [blogData, setBlogData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/blog/posts/my");
      setPendingBlogs(response.data.filter((blog) => blog.status !== "DRAFT"));
      setDraftBlogs(response.data.filter((blog) => blog.status === "DRAFT"));
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

  const handleEdit = (blog) => {
    console.log("Blog data being passed:", blog); // Thêm log để debug
    navigate("/dashboard/designblog", {
      state: {
        design: {
          id: blog.id,
          title: blog.title,
          content: blog.content,
          imageUrl: blog.coverImageUrl,
          status: blog.status,
          type: "BLOG"  // Thêm type
        },
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (blogData) {
        await api.put(`/api/blog/drafts/${blogData.id}`, values);
        message.success("Cập nhật bài viết thành công");
        setBlogData(null);
      } else {
        message.error("Không thể tạo bài viết mới. Chỉ cho phép cập nhật.");
      }

      form.resetFields();
      fetchBlogs();
    } catch (err) {
      message.error(
        "Cập nhật bài viết thất bại: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/blog/drafts/${id}`);
      message.success("Xóa nháp thành công");
      fetchBlogs();
    } catch (err) {
      message.error(
        "Xóa nháp thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = async (id) => {
    try {
      setLoading(true);
      await api.post(`/api/blog/drafts/${id}/submit`);
      message.success("Gửi nháp thành công");
      fetchBlogs();
    } catch (err) {
      message.error(
        "Gửi nháp thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const time = date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const formattedDate = date.toISOString().split("T")[0];
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
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
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
    {
      title: "Hình ảnh",
      dataIndex: "coverImageUrl",
      key: "coverImageUrl",
      render: (url) => <img src={url} alt="Blog" style={{ width: 100 }} />,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        switch (status) {
          case "DRAFT":
            return "Nháp";
        }
      },
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      showSorterTooltip: false,
      render: (text) => (
        <span style={{ whiteSpace: "pre-line" }}>{formatDateTime(text)}</span>
      ),
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      showSorterTooltip: false,
      render: (text) => (
        <span style={{ whiteSpace: "pre-line" }}>{formatDateTime(text)}</span>
      ),
    },
    {
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button type="link" onClick={() => handleEdit(record)}>
              <FaEdit />
            </Button>
          </Tooltip>
          <Tooltip title="Đưa dự án lên">
            <Popconfirm
              title="Bạn có chắc chắn muốn đưa dự án lên không?"
              onConfirm={() => handleSubmitDraft(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="link">
                <BsUpload />
              </Button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => handleDeleteDraft(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="link" danger>
                <RiDeleteBin2Fill />
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const pendingColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
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
    {
      title: "Hình ảnh",
      dataIndex: "coverImageUrl",
      key: "coverImageUrl",
      render: (url) => <img src={url} alt="Blog" style={{ width: 100 }} />,
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
          case "REJECTED":
            return "Đã từ chối";
          default:
            return status;
        }
      },
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      showSorterTooltip: false,
      render: (text) => (
        <span style={{ whiteSpace: "pre-line" }}>{formatDateTime(text)}</span>
      ),
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      showSorterTooltip: false,
      render: (text) => (
        <span style={{ whiteSpace: "pre-line" }}>{formatDateTime(text)}</span>
      ),
    },
    {
      title: "Thời gian xuất bản",
      dataIndex: "publishedAt",
      key: "publishedAt",
      sorter: (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
      showSorterTooltip: false,
      render: (text) => (
        <span style={{ whiteSpace: "pre-line" }}>{formatDateTime(text)}</span>
      ),
    },
    {
      title: "Lý do từ chối",
      dataIndex: "rejectionReason",
      key: "rejectionReason",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Bảng Drafts */}
      <div>
        <h1>Bài viết nháp</h1>
        <Table
          dataSource={filteredDrafts}
          columns={draftColumns}
          loading={loading}
          pagination={false}
          rowKey="id"
        />
      </div>

      {/* Bảng Pending có thanh search và filter */}
      <div>
        <h1>Bài viết ã gửi</h1>
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            placeholder="Chờ duyệt"
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="PENDING_APPROVAL">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
          </Select>
        </Space>
        <Table
          dataSource={filteredPendingBlogs}
          columns={pendingColumns}
          loading={loading}
          pagination={false}
          rowKey="id"
        />
      </div>

      {/* Keep only the content viewing modal */}
      <Modal
        title={currentTitle}
        open={isContentModalVisible}
        onCancel={() => setIsContentModalVisible(false)}
        footer={null}
      >
        <div dangerouslySetInnerHTML={{ __html: currentContent }} />
      </Modal>
    </div>
  );
}

export default BlogProject;
