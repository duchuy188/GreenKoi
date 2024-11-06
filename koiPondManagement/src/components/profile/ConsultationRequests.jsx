import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Modal, Form, Input, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "/src/components/config/axios";
import moment from "moment";
import { toast } from "react-toastify";

function ConsultationRequests() {
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchConsultationRequests();

    const interval = setInterval(() => {
      fetchConsultationRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchConsultationRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const customerId = localStorage.getItem("customerId");
      if (!customerId) {
        throw new Error("No customer ID found");
      }

      const response = await api.get(
        `/api/ConsultationRequests/customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const filteredRequests = response.data
        .filter((request) => request.status !== "CANCELLED")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setConsultationRequests(filteredRequests);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm yêu cầu tư vấn:", err);
      toast.error("Không tải được yêu cầu tư vấn");
    }
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record);
    setEditingRequest(record);
    editForm.setFieldsValue({
      designName: record.designName,
      notes: record.notes,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      customerAddress: record.customerAddress,
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/api/ConsultationRequests/${editingRequest.id}`,
        {
          ...editingRequest,
          ...values,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Yêu cầu đã được cập nhật thành công");
        setEditingRequest(null);
        fetchConsultationRequests();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật yêu cầu tư vấn:", err);
      toast.error("Không thể cập nhật yêu cầu tư vấn");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/ConsultationRequests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Yêu cầu đã được xóa thành công");
      fetchConsultationRequests();
    } catch (err) {
      console.error("Lỗi khi xóa yêu cầu tư vấn:", err);
      toast.error("Không thể xóa yêu cầu tư vấn");
    }
  };

  const columns = [
    {
      title: "Tên dự án",
      dataIndex: "designName",
      key: "designName",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          PENDING: { color: "gold", text: "Đang chờ" },
          COMPLETED: { color: "green", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã hủy" },
        };

        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) =>
        text ? new Date(text).toLocaleDateString() : "Chưa cập nhật",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === "PENDING" && (
          <span>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ marginRight: "10px" }}
            >
              Chỉnh sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa yêu cầu này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger>
                Xóa
              </Button>
            </Popconfirm>
          </span>
        ),
    },
  ];

  return (
    <>
      <Table dataSource={consultationRequests} columns={columns} rowKey="id" />
      <Modal
        title="Chỉnh sửa yêu cầu tư vấn"
        open={!!editingRequest}
        onCancel={() => setEditingRequest(null)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEditSubmit} layout="vertical">
          <Form.Item
            name="designName"
            label="Tên dự án"
            rules={[{ required: true, message: "Vui lòng nhập tên dự án" }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="customerName" label="Tên khách hàng">
            <Input disabled />
          </Form.Item>
          <Form.Item name="customerPhone" label="Số điện thoại">
            <Input disabled />
          </Form.Item>
          <Form.Item name="customerAddress" label="Địa chỉ">
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ConsultationRequests;
