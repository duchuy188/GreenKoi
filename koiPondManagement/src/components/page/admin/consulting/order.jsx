import React, { useState, useEffect } from "react";
import {
  Table,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Popconfirm,
  Dropdown,
  Menu,
} from "antd";
import api from "../../../config/axios";
import moment from "moment";
import {
  EditOutlined,
  DownOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editingOrder, setEditingOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/projects/consultant");
      console.log("Fetched orders:", response.data);
      // Sort orders by createdAt in descending order and filter out COMPLETED (PS6) orders
      const sortedOrders = response.data
        .filter((order) => order.statusId !== "PS6")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingOrder(record);
    form.setFieldsValue({
      ...record,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
    });
    setIsModalVisible(true);
  };
  const statusOptions = [
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "PLANNING", label: "Đang lên kế hoạch" },
    { value: "IN_PROGRESS", label: "Đang thực hiện" },
    { value: "ON_HOLD", label: "Tạm dừng" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "MAINTENANCE", label: "Bảo trì" },

    // Add more statuses as needed
  ];
  const handleUpdate = async (values) => {
    try {
      // Update general information
      await api.put(`/api/projects/${editingOrder.id}`, {
        name: values.name,
        description: values.description,
        totalPrice: values.totalPrice,
        depositAmount: values.depositAmount,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        customerId: values.customerId,
        consultantId: values.consultantId,
      });

      // Update status if changed
      if (values.statusId !== editingOrder.statusId) {
        await updateOrderStatus(editingOrder.id, values.statusId);
      }

      message.success("Order updated successfully");
      setIsModalVisible(false);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error updating order:", error);
      message.error(
        `Failed to update order: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/projects/${id}/status`, { newStatus });
      message.success("Order status updated successfully!");
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      message.error(
        err.response?.data?.message || "Error updating order status."
      );
    }
  };

  const toggleDescription = (recordId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  const paymentStatusOptions = [
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "DEPOSIT_PAID", label: "Đã cọc" },
    { value: "FULLY_PAID", label: "Đã thanh toán" },
  ];

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      console.log("Updating payment status:", id, newStatus); // Debug log
      await api.patch(`/api/projects/${id}/payment-status`, {
        paymentStatus: newStatus, // Đổi tên parameter thành paymentStatus
      });
      message.success("Cập nhật trạng thái thanh toán thành công!");
      fetchOrders();
    } catch (err) {
      console.error("Error updating payment status:", err);
      message.error(
        err.response?.data?.message || "Lỗi cập nhật trạng thái thanh toán."
      );
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      hidden: true, // This will hide the column
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (text, record) => {
        if (!text) return null;
        const shortText = text.slice(0, 100) + "...";

        return (
          <>
            <div dangerouslySetInnerHTML={{ __html: shortText }} />
            {text.length > 100 && (
              <Button
                type="link"
                onClick={() => {
                  setSelectedDescription(text);
                  setDescriptionModalVisible(true);
                }}
                icon={<EllipsisOutlined />}
              >
                Xem thêm
              </Button>
            )}
          </>
        );
      },
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 100,
    },
    {
      title: "Tiền cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      width: 100,
    },
    {
      title: "Ngày BĐ",
      dataIndex: "startDate",
      key: "startDate",
      width: 100,
    },
    {
      title: "Ngày KT",
      dataIndex: "endDate",
      key: "endDate",
      width: 100,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerId",
      key: "customerId",
      width: 150,
      hidden: true,
    },
    {
      title: "NV TV",
      dataIndex: "consultantId",
      key: "consultantId",
      width: 100,
      hidden: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "statusName",
      key: "statusName",
      width: 120,
      render: (statusName) => {
        const status = statusOptions.find((s) => s.value === statusName);
        return status ? status.label : statusName;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 150,
      render: (paymentStatus, record) => {
        const menu = (
          <Menu onClick={({ key }) => updatePaymentStatus(record.id, key)}>
            {paymentStatusOptions.map((status) => (
              <Menu.Item key={status.value}>{status.label}</Menu.Item>
            ))}
          </Menu>
        );

        const currentStatus =
          paymentStatusOptions.find((s) => s.value === paymentStatus)?.label ||
          "Chưa thanh toán";

        return (
          <Dropdown overlay={menu}>
            <Button>
              {currentStatus} <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      render: (_, record) => {
        const menu = (
          <Menu onClick={({ key }) => updateOrderStatus(record.id, key)}>
            {statusOptions.map((status) => (
              <Menu.Item key={status.value}>{status.label}</Menu.Item>
            ))}
          </Menu>
        );

        return (
          <>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ marginRight: 8 }}
            />
            <Dropdown overlay={menu}>
              <Button icon={<DownOutlined />} />
            </Dropdown>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <h1>Đơn hàng của khách hàng</h1>
      <Table
        columns={columns.filter((column) => !column.hidden)}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{ defaultSortOrder: "descend" }}
      />
      <Modal
        title="Edit Order"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea readOnly />
          </Form.Item>
          <Form.Item
            name="totalPrice"
            label="Total Price"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="depositAmount" label="Deposit Amount">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true }]}
            readOnly
          >
            <DatePicker readOnly />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true }]}
            readOnly
          >
            <DatePicker readOnly />
          </Form.Item>
          <Form.Item name="customerId" label="Customer ID" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="consultantId" label="Consultant ID" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="createdAt" label="Created At" readOnly>
            <Input readOnly />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Order
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi tiết mô tả"
        visible={descriptionModalVisible}
        onCancel={() => setDescriptionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDescriptionModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <div
          style={{ maxHeight: "500px", overflow: "auto" }}
          dangerouslySetInnerHTML={{ __html: selectedDescription }}
        />
      </Modal>
    </div>
  );
};

export default Orders;
