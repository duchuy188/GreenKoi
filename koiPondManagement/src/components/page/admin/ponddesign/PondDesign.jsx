import React, { useState } from "react";
import { Form, Input, InputNumber, Button, message, Card, Row, Col } from "antd";
import api from "../../../config/axios";

function PondDesign() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pondData, setPondData] = useState(null);

  // Handle form submission (create or update)
  const handleSubmit = async (values) => {
    try {
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
    } catch (err) {
      message.error("Failed to " + (pondData ? "update" : "create") + " pond design: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, marginLeft: "8%" }}>
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

          <Form.Item name="imageUrl" label="ImageUrl" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter pond imageUrl" />
          </Form.Item>

          <Form.Item name="features" label="Features" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter pond features" />
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
    </div>
  );
}

export default PondDesign;