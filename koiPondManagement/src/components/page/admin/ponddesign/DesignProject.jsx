import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Card, Table, Tooltip, Popconfirm, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";

const { Search } = Input;

function DesignProject() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pondData, setPondData] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [designerPonds, setDesignerPonds] = useState([]);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
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

  // Fetch pond design by ID
  const fetchPondDesignById = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/pond-designs/${id}`);
      setSearchResult(response.data);
    } catch (err) {
      message.error("Failed to fetch pond design: " + (err.response?.data?.message || err.message));
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
      console.log("Form values:", values); // Kiểm tra dữ liệu gửi đi

      if (pondData) {
        // Update existing pond design
        console.log("Updating pond design with ID:", pondData.id);
        await api.put(`/api/pond-designs/${pondData.id}`, values);
        message.success("Pond design updated successfully");
        setPondData(null);
      } else {
        // Nếu không có pondData, không làm gì cả
        message.error("Cannot create a new pond design. Only updates are allowed.");
      }

      form.resetFields();
      fetchDesignerPonds();
    } catch (err) {
      message.error("Failed to update pond design: " + (err.response?.data?.message || err.message));
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
      message.error("Failed to delete pond design: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle showing description modal
  const showDescriptionModal = (description) => {
    setCurrentDescription(description);
    setIsDescriptionModalVisible(true);
  };

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
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Tooltip title="Edit">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setPondData(record);
                form.setFieldsValue(record);
              }}
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
            <Tooltip title="Delete">
              <Button 
                variant="ghost" 
                size="icon"
              >
                <RiDeleteBin2Fill />
              </Button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 15500, margin: "0 auto", padding: 24 }}>
      <Card title="Tìm kiếm Dự án bằng ID" bordered={false}>
        <Search
          placeholder="Nhập ID Hồ"
          enterButton="Tìm Kiếm"
          onSearch={fetchPondDesignById}
          style={{ marginBottom: 24 }}
        />
      </Card>

      {searchResult && (
        <Table columns={columns} dataSource={[searchResult]} rowKey="id" pagination={false} style={{ marginTop: 24 }} />
      )}

      <Card title="Dự án Hồ" bordered={false} style={{ marginTop: 24 }}>
        <Table columns={columns} dataSource={designerPonds} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title="Mô tả chi tiết"
        open={isDescriptionModalVisible}
        onOk={() => setIsDescriptionModalVisible(false)}
        closable={false}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }} // Ẩn nút Cancel
      >
        <p>{currentDescription}</p>
      </Modal>
    </div>
  );
}

export default DesignProject;
