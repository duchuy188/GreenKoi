import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, message, Card, Row, Col, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";

const { Search } = Input;

function PondDesign() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pondData, setPondData] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [designerPonds, setDesignerPonds] = useState([]);
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
        // Create new pond design
        await api.post("/api/pond-designs", values);
        message.success("Pond design created successfully");
      }
      form.resetFields();
      fetchDesignerPonds();
    } catch (err) {
      message.error("Failed to " + (pondData ? "update" : "create") + " pond design: " + (err.response?.data?.message || err.message));
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // Updated columns definition
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Base Price", dataIndex: "basePrice", key: "basePrice" },
    { title: "Shape", dataIndex: "shape", key: "shape" },
    { title: "Dimensions", dataIndex: "dimensions", key: "dimensions" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <span>
          {record.status === 'approved' ? (
            <Tag color="green">Approved</Tag>
          ) : record.status === 'rejected' ? (
            <Tag color="red">Rejected</Tag>
          ) : (
            <Tag color="orange">Pending</Tag>
          )}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => {
            setPondData(record);
            form.setFieldsValue(record);
          }}>
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
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, marginLeft: "8%" }}>
      <Card title="Search Pond Design by ID" bordered={false}>
        <Search
          placeholder="Enter Pond Design ID"
          enterButton="Search"
          onSearch={fetchPondDesignById}
          style={{ marginBottom: 24 }}
        />
      </Card>

      {searchResult && (
        <Table columns={columns} dataSource={[searchResult]} rowKey="id" pagination={false} style={{ marginTop: 24 }} />
      )}

      <Card title={pondData ? "Edit Pond Design" : "Create Pond Design"} bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {pondData ? "Update Pond Design" : "Create Pond Design"}
            </Button>
            {pondData && (
              <Button style={{ marginLeft: 8 }} onClick={() => {
                setPondData(null);
                form.resetFields();
              }}>
                Cancel Edit
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>

      <Card title="Your Pond Designs" bordered={false} style={{ marginTop: 24 }}>
        <Table columns={columns} dataSource={designerPonds} rowKey="id" pagination={false} />
      </Card>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Button onClick={handleLogout} type="default">
          Logout
        </Button>
      </div>
    </div>
  );
}

export default PondDesign;
