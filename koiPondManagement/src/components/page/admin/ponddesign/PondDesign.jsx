import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, message, Card, Row, Col, Table } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";

const { Search } = Input;  // Sử dụng thành phần Search từ Input

function PondDesign() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pondData, setPondData] = useState(null); // Dữ liệu hiện tại của hồ cá
  const [pondList, setPondList] = useState([]); // Danh sách các hồ cá
  const [searchResult, setSearchResult] = useState(null); // Kết quả tìm kiếm
  const navigate = useNavigate();

  // Fetch all pond designs
  const fetchPondDesigns = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/pond-designs");
      setPondList(response.data);
    } catch (err) {
      console.error("Error fetching pond designs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pond design by ID
  const fetchPondDesignById = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/pond-designs/${id}`);
      setSearchResult(response.data);  // Lưu kết quả tìm kiếm vào state
    } catch (err) {
      message.error("Failed to fetch pond design: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPondDesigns(); // Fetch all pond designs on component mount
  }, []);

  // Create new pond design
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await api.post("/api/pond-designs", values);
      message.success("Pond design created successfully");
      form.resetFields();
      setPondList([...pondList, response.data]); // Add newly created design to the list
    } catch (err) {
      message.error("Failed to create pond design: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Update existing pond design
  const handleUpdate = async (values) => {
    if (!pondData) {
      message.error("No pond design selected to update.");
      return;
    }
    try {
      setLoading(true);
      await api.put(`/api/pond-designs/${pondData.id}`, values);
      message.success("Pond design updated successfully");

      // Update pond list with new data
      const updatedList = pondList.map((item) =>
        item.id === pondData.id ? { ...item, ...values } : item
      );
      setPondList(updatedList);
      setPondData(null);
      form.resetFields();
    } catch (err) {
      message.error("Failed to update pond design: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete pond design
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/pond-designs/${id}`);
      message.success("Pond design deleted successfully");
      setPondList(pondList.filter((item) => item.id !== id)); // Remove deleted design from list
    } catch (err) {
      message.error("Failed to delete pond design: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // Table columns
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "NAME", dataIndex: "name", key: "name" },
    { title: "DESCRIPTION", dataIndex: "description", key: "description" },
    { title: "IMAGE URL", dataIndex: "imageUrl", key: "imageUrl" },
    { title: "BASE PRICE", dataIndex: "basePrice", key: "basePrice" },
    { title: "SHAPE", dataIndex: "shape", key: "shape" },
    { title: "DIMENSIONS", dataIndex: "dimensions", key: "dimensions" },
    { title: "FEATURES", dataIndex: "features", key: "features" },
    { title: "CREATED BY", dataIndex: "createdById", key: "createdById" }, // Thêm cột createdById
    {
      title: "ACTION",
      key: "action",
      render: (_, record) => (
        <span>
          {/* Edit button fetches the pond design by its ID */}
          <Button
            type="link"
            onClick={() => fetchPondDesignById(record.id)} // Fetch pond design by ID
          >
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, marginLeft: "4%" }}>
      {/* Search input for fetching pond design by ID */}
      <Card title="Search Pond Design by ID" bordered={false}>
        <Search
          placeholder="Enter Pond Design ID"
          enterButton="Search"
          onSearch={fetchPondDesignById}  // Gọi API tìm kiếm theo ID
          style={{ marginBottom: 24 }}
        />
      </Card>

      {/* Nếu có kết quả tìm kiếm thì hiển thị bảng với kết quả này */}
      {searchResult && (
        <Table columns={columns} dataSource={[searchResult]} rowKey="id" pagination={false} style={{ marginTop: 24 }} />
      )}

      {/* Form for creating or editing a pond design */}
      <Card title="Create or Edit Pond Design" bordered={false}>
        <Form form={form} layout="vertical" onFinish={pondData ? handleUpdate : handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Enter pond name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shape" label="Shape" rules={[{ required: true }]}>
                <Input placeholder="Enter pond shape" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="basePrice" label="Base Price" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Enter base price" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dimensions" label="Dimensions" rules={[{ required: true }]}>
                <Input placeholder="Enter pond dimensions" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter pond description" />
          </Form.Item>

          <Form.Item name="imageUrl" label="Image URL">
            <Input placeholder="Enter image URL" />
          </Form.Item>

          <Form.Item name="features" label="Features">
            <Input placeholder="Enter pond features" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {pondData ? "Update Pond Design" : "Create Pond Design"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Table displaying pond designs */}
      <Table columns={columns} dataSource={pondList} rowKey="id" pagination={false} style={{ marginTop: 24 }} />

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Button onClick={handleLogout} type="default">
          Logout
        </Button>
      </div>
    </div>
  );
}

export default PondDesign;
