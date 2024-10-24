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
        await api.put(`/api/pond-designs/${pondData.id}`, values);
        message.success("Pond design updated successfully");
        setPondData(null);
        setIsEditModalVisible(false); // Đóng modal sau khi cập nhật thành công
      } else {
        message.error(
          "Cannot create a new pond design. Only updates are allowed."
        );
      }

      form.resetFields();
      fetchDesignerPonds();
    } catch (err) {
      message.error(
        "Failed to update pond design: " +
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
      await api.delete(`/api/pond-designs/${id}`);
      message.success("Pond design deleted successfully");
      fetchDesignerPonds();
    } catch (err) {
      message.error(
        "Failed to delete pond design: " +
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
    setPondData(pond);
    form.setFieldsValue(pond);  // Gán giá trị hiện tại của hồ vào form để chỉnh sửa
    setIsEditModalVisible(true);  // Hiển thị modal
  };

  // Đóng modal chỉnh sửa
  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    form.resetFields();  // Reset form sau khi đóng modal
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
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên Hồ", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span>
          {text.slice(0, 50)}...
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
    { title: "Đặc Trưng", dataIndex: "features", key: "features" },
    { title: "Giá", dataIndex: "basePrice", key: "basePrice" },
    { title: "Tạo bởi", dataIndex: "createdById", key: "createdById" },
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
              onClick={() => showEditModal(record)}  // Mở modal và gửi dữ liệu hồ cần chỉnh sửa
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
    <div style={{ maxWidth: 1550, margin: "0 auto", padding: 24 }}>
      <Card>
        <h1>CÁC DỰ ÁN HỒ</h1>
        <Search
          placeholder="Tìm kiếm"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginRight: 16 }} // Thêm khoảng cách 16px
        />
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
        <p>{currentDescription}</p>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa Thiết kế Hồ"
        open={isEditModalVisible}
        onOk={form.submit}  // Khi nhấn OK sẽ submit form
        onCancel={handleEditModalClose}  // Đóng modal khi nhấn Cancel
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}  // Hàm xử lý khi submit form
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
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Hình dáng"
            name="shape"
            rules={[{ required: true, message: "Vui lòng nhập hình dáng" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Kích Thước"
            name="dimensions"
            rules={[{ required: true, message: "Vui lòng nhập kích thước" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Đặc Trưng"
            name="features"
          >
            <Input />
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
