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
  Image,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

const { Search } = Input;
const { Option } = Select;

function DesignProject() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pondData, setPondData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [designerPonds, setDesignerPonds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Thêm state cho modal chỉnh sửa
  const navigate = useNavigate();

  // Fetch pond designs for the designer
  const fetchDesignerPonds = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/pond-designs/designer");
      setDesignerPonds(response.data);
    } catch (err) {
      console.error("Error fetching designer's pond designs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignerPonds();
  }, []);

  // Handle form submission (create or update)
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (pondData) {
        await api.put(`/api/pond-designs/${pondData.id}`, values); // Sửa dấu backtick
        toast.success("Cập nhật thiết kế hồ thành công");
        setPondData(null);
        setIsEditModalVisible(false);
      } else {
        message.error("Không thể tạo thiết kế hồ mới. Chỉ cho phép cập nhật.");
      }

      form.resetFields();
      fetchDesignerPonds();
    } catch (err) {
      toast.error(
        "Cập nhật thiết kế hồ thất bại: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle delete pond design
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(`/api/pond-designs/${id}`);
      if (response.status === 200) {
        toast.success("Xóa thiết kế hồ thành công");
        fetchDesignerPonds();
      }
    } catch (err) {
      toast.error("Xóa thiết kế hồ thất bại", {
        hideProgressBar: true,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle showing description modal
  const showDescriptionModal = (description) => {
    setCurrentDescription(description);
    setIsDescriptionModalVisible(true);
  };

  // Hiển thị modal chỉnh sửa
  const showEditModal = (pond) => {
    navigate(`/dashboard/ponddesign`, { state: { pond } }); // Sửa dấu backtick
  };

  // Đóng modal chỉnh sửa
  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    form.resetFields(); // Reset form sau khi đóng modal
  };

  // Filter và sort designer ponds based on status and search text
  const filteredPonds = designerPonds
    .filter(
      (pond) =>
        (statusFilter === "ALL" || pond.status === statusFilter) &&
        (pond.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          pond.id?.toString().includes(searchText))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Updated columns definition
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    { title: "Tên Hồ", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span>
          <Button type="link" onClick={() => showDescriptionModal(text)}>
            Xem thêm
          </Button>
        </span>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
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
    { title: "Hình dáng", dataIndex: "shape", key: "shape" },
    { title: "Kích Thước", dataIndex: "dimensions", key: "dimensions" },
    {
      title: "Đặc Trưng",
      dataIndex: "features",
      key: "features",
      render: (text) => (
        <span>
          <Button type="link" onClick={() => showDescriptionModal(text)}>
            Xem thêm
          </Button>
        </span>
      ),
    },
    {
      title: "Giá",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) =>
        price
          ?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })
          .replace("₫", "VNĐ") || "0 VNĐ",
    },
    {
      title: "Ngày tạo",
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
      title: "Ngày chỉnh sửa",
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
          default:
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    { title: "Lý do", dataIndex: "rejectionReason", key: "rejectionReason" },
    {
      title: "Hành Động",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Tooltip title="Chỉnh sửa">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => showEditModal(record)}
              style={{ color: "#1890ff" }}
            >
              <FaEdit />
            </Button>
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thiết kế này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button variant="ghost" size="icon" style={{ color: "#ff4d4f" }}>
                <RiDeleteBin2Fill />
              </Button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1550, margin: "0 auto" }}>
      <Card>
        <h1>CÁC DỰ ÁN HỒ</h1>
        <Select
          defaultValue="ALL"
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 200 }}
        >
          <Option value="ALL">Tất cả</Option>
          <Option value="PENDING_APPROVAL">Đang chờ xử lý</Option>
          <Option value="APPROVED">Đã chấp nhận</Option>
          <Option value="REJECTED">Đã từ chối</Option>
        </Select>
        <Table
          columns={columns}
          dataSource={filteredPonds}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          locale={{
            cancelSort: "Bỏ sắp xếp",
            triggerAsc: "Sắp xếp tăng dần",
            triggerDesc: "Sắp xếp giảm dần",
          }}
        />
      </Card>

      <Modal
        title="Mô tả chi tiết"
        open={isDescriptionModalVisible}
        onCancel={() => setIsDescriptionModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsDescriptionModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div
            dangerouslySetInnerHTML={{ __html: currentDescription }}
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              textAlign: "justify",
            }}
          />
        </div>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa Thiết kế Hồ"
        open={isEditModalVisible}
        onOk={form.submit} // Khi nhấn OK sẽ submit form
        onCancel={handleEditModalClose} // Đóng modal khi nhấn Cancel
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit} // Hàm xử lý khi submit form
        >
          <Form.Item
            label="Tên Hồ"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên hồ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="basePrice"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DesignProject;
