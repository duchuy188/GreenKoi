import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Modal, Form, Input, Tag, Radio, Tooltip, Space, Tabs } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "/src/components/config/axios";
import moment from "moment";
import { toast } from "react-toastify";

function ConsultationRequests() {
  const [standardRequests, setStandardRequests] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchAllRequests();

    const interval = setInterval(() => {
      fetchAllRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customerId");
      if (!token || !customerId) {
        throw new Error("Missing authentication data");
      }

      const response = await api.get(
        `/api/ConsultationRequests/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Phân loại requests
      const standard = response.data
        .filter(request => request.status !== "CANCELLED" && request.designId != null)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const custom = response.data
        .filter(request => request.status !== "CANCELLED" && request.customDesign)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setStandardRequests(standard);
      setCustomRequests(custom);
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
        fetchAllRequests();
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
      fetchAllRequests();
    } catch (err) {
      console.error("Lỗi khi xóa yêu cầu tư vấn:", err);
      toast.error("Không thể xóa yêu cầu tư vấn");
    }
  };

  // Cột cho thiết kế có sẵn
  const standardColumns = [
    {
      title: "Tên dự án",
      dataIndex: "designName",
      key: "designName",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (text) => {
        if (!text) return null;
        const shortText = text.length > 50 ? `${text.slice(0, 50)}...` : text;
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          PENDING: { color: "gold", text: "Đang chờ" },
          PROCEED_DESIGN: { color: "cyan", text: "Chuyển sang thiết kế" },
          COMPLETED: { color: "green", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã hủy" },
        };
        return <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === "PENDING" && (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
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
          </Space>
        ),
    },
  ];

  // Cột cho thiết kế tùy chỉnh
  const customColumns = [
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Loại hồ",
      dataIndex: "preferredStyle",
      key: "preferredStyle",
    },
    {
      title: "Kích thước",
      dataIndex: "dimensions",
      key: "dimensions",
    },
    {
      title: "Yêu cầu thiết kế",
      dataIndex: "requirements",
      key: "requirements",
      render: (text) => {
        if (!text) return null;
        const shortText = text.length > 50 ? `${text.slice(0, 50)}...` : text;
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",
      render: (value) => {
        return value ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '';
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          PENDING: { color: "gold", text: "Đang chờ" },
          PROCEED_DESIGN: { color: "cyan", text: "Chuyển sang thiết kế" },
          COMPLETED: { color: "green", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã hủy" },
        };
        return <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>;
      },
    },
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Thiết kế có sẵn" key="1">
          <Table 
            dataSource={standardRequests} 
            columns={standardColumns} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '100%',
            }}
            scroll={{ x: 'max-content' }}
            locale={{ 
              emptyText: `Không có yêu cầu thiết kế có sẵn nào` 
            }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Thiết kế tùy chỉnh" key="2">
          <Table 
            dataSource={customRequests} 
            columns={customColumns} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '100%',
            }}
            scroll={{ x: 'max-content' }}
            locale={{ 
              emptyText: `Không có yêu cầu thiết kế tùy chỉnh nào` 
            }}
          />
        </Tabs.TabPane>
      </Tabs>
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
    </div>
  );
}

export default ConsultationRequests;
