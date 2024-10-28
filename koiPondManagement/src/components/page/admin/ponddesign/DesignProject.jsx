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
        message.success("Cập nhật thiết kế hồ thành công");
        setPondData(null);
        setIsEditModalVisible(false);
      } else {
        message.error("Không thể tạo thiết kế hồ mới. Chỉ cho phép cập nhật.");
      }

      form.resetFields();
      fetchDesignerPonds();
    } catch (err) {
      message.error(
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
      await api.delete(`/api/pond-designs/${id}`); // Sửa dấu backtick
      message.success("Xóa thiết kế hồ thành công");
      fetchDesignerPonds();
    } catch (err) {
      message.error(
        "Xóa thiết kế hồ thất bại: " +
          (err.response?.data?.message || err.message)
      );
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

  // Filter designer ponds based on status and search text
  const filteredPonds = designerPonds.filter(
    (pond) =>
      (statusFilter === "ALL" || pond.status === statusFilter) &&
      (pond.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        pond.id?.toString().includes(searchText))
  );

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
          {text ? text.slice(0, 5) : "No description available"}...
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
        <img src={url} alt="Pond Design" style={{ width: 100 }} />
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
          {text ? text.slice(0, 5) : "No features available"}...
          <Button type="link" onClick={() => showDescriptionModal(text)}>
            Xem thêm
          </Button>
        </span>
      ),
    },
    { title: "Giá", dataIndex: "basePrice", key: "basePrice" },
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
    { title: "Lý do", dataIndex: "rejectionReason", key: "rejectionReason" },
    {
      key: "action",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Tooltip title="Chỉnh sửa">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => showEditModal(record)} // Mở modal và gửi dữ liệu hồ cần chỉnh sửa
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
              <Button variant="ghost" size="icon">
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
          pagination={false}
        />
      </Card>

      <Modal
        title="Mô tả chi tiết"
        open={isDescriptionModalVisible}
        onOk={() => setIsDescriptionModalVisible(false)}
        closable={false}
        okText="Đóng"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <div dangerouslySetInnerHTML={{ __html: currentDescription }} />
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
