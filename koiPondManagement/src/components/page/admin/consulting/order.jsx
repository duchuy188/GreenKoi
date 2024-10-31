import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Popconfirm,
  Dropdown,
  Menu,
  Tooltip,
  Space,
} from "antd";
import api from "../../../config/axios";
import moment from "moment";
import {
  EditOutlined,
  DownOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editingOrder, setEditingOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isShowingDetail, setIsShowingDetail] = useState(false);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/projects/consultant");
      const sortedOrders = response.data
        .filter((order) => order.statusId !== "PS6")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
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
    { value: "TECHNICALLY_COMPLETED", label: "Đã hoàn thành kỹ thuật" },

    // Add more statuses as needed
  ];
  const handleUpdate = async (values) => {
    try {
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

      if (values.statusId !== editingOrder.statusId) {
        await updateOrderStatus(editingOrder.id, values.statusId);
      }

      toast.success("Cập nhật đơn hàng thành công");
      setIsModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(
        `Không thể cập nhật đơn hàng: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/projects/${id}/status`, { newStatus });
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng"
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
      await api.patch(`/api/projects/${id}/payment-status`, {
        paymentStatus: newStatus,
      });
      toast.success("Cập nhật trạng thái thanh toán thành công!");
      fetchOrders();
    } catch (err) {
      console.error("Error updating payment status:", err);
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái thanh toán"
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
        const shortText = text.slice(0, 50) + "...";
        return (
          <>
            <span>{shortText}</span>
            {text.length > 50 && (
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
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 100,
    },
    {
      title: "Ngày kết thúc",
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
        const menuItems = {
          items: paymentStatusOptions.map((status) => ({
            key: status.value,
            label: status.label,
          })),
          onClick: ({ key }) => updatePaymentStatus(record.id, key),
        };

        const currentStatus =
          paymentStatusOptions.find((s) => s.value === paymentStatus)?.label ||
          "Chưa thanh toán";

        return (
          <Dropdown menu={menuItems}>
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
        const menuItems = {
          items: statusOptions.map((status) => ({
            key: status.value,
            label: status.label,
          })),
          onClick: ({ key }) => updateOrderStatus(record.id, key),
        };

        return (
          <>
            <Tooltip title="Chỉnh sửa đơn hàng">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
            <Dropdown menu={menuItems}>
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
        title="Chỉnh sửa đơn hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true }]}
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Space direction="vertical" style={{ width: "100%" }}>
              {!isShowingDetail ? (
                <Button type="primary" onClick={() => setIsShowingDetail(true)}>
                  Xem chi tiết
                </Button>
              ) : (
                <>
                  <div
                    dangerouslySetInnerHTML={createMarkup(
                      form.getFieldValue("description")
                    )}
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: "2px",
                      padding: "10px",
                      minHeight: "200px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      backgroundColor: "#fff",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}
                  />
                  <Button onClick={() => setIsShowingDetail(false)}>
                    Thu gọn
                  </Button>
                </>
              )}
            </Space>
          </Form.Item>
          <Form.Item
            name="totalPrice"
            label="Tổng giá tiền"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="depositAmount" label="Số tiền gửi">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true }]}
            readOnly
          >
            <DatePicker readOnly />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
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
          <Form.Item name="createdAt" label="Được tạo ngày" readOnly>
            <Input readOnly />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật đơn hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Mô tả thiết kế"
        open={descriptionModalVisible}
        onCancel={() => setDescriptionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDescriptionModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
        maskClosable={true}
        centered
        styles={{
          body: {
            maxHeight: "80vh",
            overflowY: "auto",
          },
        }}
      >
        <div
          style={{
            padding: "20px",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "rgba(0, 0, 0, 0.85)",
          }}
          dangerouslySetInnerHTML={createMarkup(selectedDescription)}
        />
      </Modal>
    </div>
  );
};

export default Orders;
