import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Table,
  Tooltip,
  Popconfirm,
  Modal,
  Select,
  Space,
  Typography,
  Tag,
  Image,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { BsUpload } from "react-icons/bs";
import { toast } from "react-toastify";

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
          coverImageUrl: blog.coverImageUrl,
          status: blog.status,
          type: "BLOG", // Thêm type
        },
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (blogData) {
        await api.put(`/api/blog/drafts/${blogData.id}`, values);
        toast.success("Cập nhật bài viết thành công");
        setBlogData(null);
      } else {
        message.error("Không thể tạo bài viết mới. Chỉ cho phép cập nhật.");
      }

      form.resetFields();
      fetchBlogs();
    } catch (err) {
      toast.error(
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
      toast.success("Xóa nháp thành công");
      fetchBlogs();
    } catch (err) {
      toast.error(
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
      toast.success("Gửi nháp thành công");
      fetchBlogs();
    } catch (err) {
      toast.error(
        "Gửi nháp thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredDrafts = draftBlogs
    .filter(
      (blog) =>
        blog.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.id?.toString().includes(searchText)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredPendingBlogs = pendingBlogs
    .filter(
      (blog) =>
        (statusFilter === "ALL" || blog.status === statusFilter) &&
        (blog.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          blog.id?.toString().includes(searchText))
    )
    .sort((a, b) => {
      // Nếu cả hai bài viết đều chưa được duyệt (1970-01-01 hoặc null)
      const isADefault =
        a.publishedAt === "1970-01-01T07:00:00.000Z" || a.publishedAt === null;
      const isBDefault =
        b.publishedAt === "1970-01-01T07:00:00.000Z" || b.publishedAt === null;

      if (isADefault && isBDefault) {
        // Nếu cả hai chưa được duyệt, sắp xếp theo thời gian tạo mới nhất
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (isADefault) {
        // Nếu A chưa được duyệt, đẩy xuống dưới
        return 1;
      } else if (isBDefault) {
        // Nếu B chưa được duyệt, đẩy xuống dưới
        return -1;
      }
      // Nếu cả hai đều đã được duyệt, sắp xếp theo thời gian xuất bản mới nhất
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

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
      render: (url) => (
        <Image
          src={url}
          alt="Blog"
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
          case "REJECTED":
            color = "red";
            text = "Đã từ chối";
            break;
          case "DRAFT":
            color = "blue";
            text = "Nháp";
            break;
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      render: (text) => {
        if (!text) return null;
        const date = new Date(text);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const time = date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return (
          <>
            <div>{formattedDate}</div>
            <div>{time}</div>
          </>
        );
      },
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      render: (text) => {
        if (!text) return null;
        const date = new Date(text);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const time = date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return (
          <>
            <div>{formattedDate}</div>
            <div>{time}</div>
          </>
        );
      },
    },
    {
      title: "Hành Động",
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
              title="Bạn có muốn muốn xóa?"
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
      render: (url) => (
        <Image
          src={url}
          alt="Blog"
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
          case "REJECTED":
            color = "red";
            text = "Đã từ chối";
            break;
          case "DRAFT":
            color = "blue";
            text = "Nháp";
            break;
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      render: (text) => {
        if (!text) return null;
        const date = new Date(text);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const time = date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return (
          <>
            <div>{formattedDate}</div>
            <div>{time}</div>
          </>
        );
      },
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      render: (text) => {
        if (!text) return null;
        const date = new Date(text);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const time = date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return (
          <>
            <div>{formattedDate}</div>
            <div>{time}</div>
          </>
        );
      },
    },
    {
      title: "Thời gian xuất bản",
      dataIndex: "publishedAt",
      key: "publishedAt",
      sorter: (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
      render: (text) => {
        if (text === "1970-01-01T07:00:00.000Z" || text === null) {
          return "Chưa được duyệt";
        }
        const date = new Date(text);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const time = date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return (
          <>
            <div>{formattedDate}</div>
            <div>{time}</div>
          </>
        );
      },
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
          pagination={{ pageSize: 5 }}
          rowKey="id"
          locale={{
            cancelSort: "Bỏ sắp xếp",
            triggerAsc: "Sắp xếp tăng dần",
            triggerDesc: "Sắp xếp giảm dần",
          }}
        />
      </div>

      {/* Bảng Pending có thanh search và filter */}
      <div>
        <h1>Bài viết đã gửi</h1>
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            placeholder="Chọn trạng thái"
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
          pagination={{ pageSize: 5 }}
          rowKey="id"
          locale={{
            cancelSort: "Bỏ sắp xếp",
            triggerAsc: "Sắp xếp tăng dần",
            triggerDesc: "Sắp xếp giảm dần",
          }}
        />
      </div>

      {/* Content modal */}
      <Modal
        title="Nội dung bài viết"
        open={isContentModalVisible}
        onCancel={() => setIsContentModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsContentModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div
            dangerouslySetInnerHTML={{ __html: currentContent }}
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              textAlign: "justify",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default BlogProject;
