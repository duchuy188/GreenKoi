import React, { useState, useEffect, useRef } from "react";
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
  Tag,
  Select,
  Row,
  Col,
  Switch,
} from "antd";
import api from "../../../config/axios";
import moment from "moment";
import {
  EditOutlined,
  DownOutlined,
  EllipsisOutlined,
  SearchOutlined,
  ReloadOutlined,
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
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const pollingIntervalRef = useRef(null);

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  useEffect(() => {
    fetchOrders();

    if (isPollingEnabled) {
      pollingIntervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchOrders(true);
        }
      }, 30000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPollingEnabled]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOrders(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchOrders = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }

      const response = await api.get("/api/projects/consultant");

      if (response.data) {
        const newOrders = response.data
          .filter((order) => order.statusId !== "PS6")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders((prevOrders) => {
          if (JSON.stringify(prevOrders) !== JSON.stringify(newOrders)) {
            return newOrders;
          }
          return prevOrders;
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!isBackgroundRefresh) {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const handleEdit = (record) => {
    setEditingOrder(record);
    form.setFieldsValue({
      ...record,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
      createdAt: moment(record.createdAt).format("DD/MM/YYYY HH:mm"),
    });
    setIsModalVisible(true);
  };
  const statusOptions = [
    { value: "PENDING", label: "Chờ duyệt", color: "orange" },
    { value: "APPROVED", label: "Đã duyệt", color: "green" },
    { value: "PLANNING", label: "Đang lên kế hoạch", color: "blue" },
    { value: "IN_PROGRESS", label: "Đang thực hiện", color: "processing" },
    { value: "ON_HOLD", label: "Tạm dừng", color: "warning" },
    { value: "CANCELLED", label: "Đã hủy", color: "red" },
    { value: "MAINTENANCE", label: "Bảo trì", color: "cyan" },
    { value: "TECHNICALLY_COMPLETED", label: "Đã hoàn thành kỹ thuật", color: "lime" },
  ];
  const statusOptionsWithAll = [
    { value: "ALL", label: "Tất cả", color: "default" },
    ...statusOptions,
  ];

  const paymentStatusOptions = [
    { value: "UNPAID", label: "Chưa thanh toán", color: "red" },
    { value: "DEPOSIT_PAID", label: "Đã cọc", color: "gold" },
    { value: "FULLY_PAID", label: "Đã thanh toán", color: "green" },
  ];
  const paymentStatusOptionsWithAll = [
    { value: "ALL", label: "Tất cả", color: "default" },
    ...paymentStatusOptions,
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
      const response = await api.patch(`/api/projects/${id}/status`, {
        newStatus,
      });

      // Kiểm tra response status để đảm bảo request thành công
      if (response.status === 200 || response.status === 204) {
        toast.success("Cập nhật trạng thái đơn hàng thành công!");
        fetchOrders();
        return; // Thoát khỏi hàm nếu thành công
      }
    } catch (err) {
      const errorMap = {
        "Consultant can only update to: APPROVED, CANCELLED, ON_HOLD, IN_PROGRESS":
          "Nhân viên tư vấn chỉ có thể cập nhật sang các trạng thái: Đã duyệt, Đã hủy, Tạm dừng, Đang thực hiện",
        "Consultant cannot mark project as technically completed":
          "Nhân viên tư vấn không thể đánh dấu dự án là đã hoàn thành kỹ thuật",
      };

      // Kiểm tra xem có phải lỗi về quyền cập nhật trạng thái không
      if (err.response?.status === 403 || err.response?.status === 400) {
        const errorMessage = err.response?.data?.message;
        const vietnameseError =
          errorMap[errorMessage] ||
          errorMessage ||
          "Có lỗi xảy ra khi cập nhật trạng thái";
        toast.error(vietnameseError);
        return;
      }

      // Nếu là lỗi khác, hiển thị thông báo chung
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const toggleDescription = (recordId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  const updatePaymentStatus = async (id, newStatus, currentStatus) => {
    try {
      if (currentStatus === "FULLY_PAID") {
        toast.error("Không thể thay đổi trạng thái khi đã thanh toán đầy đủ");
        return;
      }

      if (currentStatus === "DEPOSIT_PAID" && newStatus === "UNPAID") {
        toast.error("Không thể chuyển từ trạng thái đã cọc về chưa thanh toán");
        return;
      }

      if (currentStatus === "UNPAID" && newStatus === "FULLY_PAID") {
        toast.error("Không thể chuyển trực tiếp từ chưa thanh toán sang đã thanh toán đầy đủ");
        return;
      }

      await api.patch(`/api/projects/${id}/payment-status`, {
        paymentStatus: newStatus,
      });
      toast.success("Cập nhật trạng thái thanh toán thành công!");
      fetchOrders();
    } catch (err) {
      console.error("Error updating payment status:", err);
      if (err.response?.data?.message === "Project must be technically completed before marking as fully paid") {
        toast.error("Dự án phải được hoàn thành kỹ thuật trước khi đánh dấu là đã thanh toán đầy đủ");
      } else {
        toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái thanh toán");
      }
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
      render: (price) => price?.toLocaleString("vi-VN") + " VNĐ",
    },
    {
      title: "Tiền cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      width: 100,
      render: (price) => price?.toLocaleString("vi-VN") + " VNĐ",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (date) => moment(date).format("DD/MM/YYYY"),
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
        return status ? (
          <Tag color={status.color}>{status.label}</Tag>
        ) : (
          statusName
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ["descend", "ascend", null],
      showSorterTooltip: false,
      locale: {
        cancelSort: "Bỏ sắp xếp",
        triggerAsc: "Sắp xếp tăng dần",
        triggerDesc: "Sắp xếp giảm dần",
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 150,
      render: (paymentStatus, record) => {
        const currentStatus = paymentStatusOptions.find(
          (s) => s.value === paymentStatus
        );

        let availableStatuses = [...paymentStatusOptions];
        if (paymentStatus === "FULLY_PAID") {
          availableStatuses = [];
        } else if (paymentStatus === "DEPOSIT_PAID") {
          availableStatuses = paymentStatusOptions.filter(
            (s) => s.value === "FULLY_PAID"
          );
        } else if (paymentStatus === "UNPAID") {
          availableStatuses = paymentStatusOptions.filter(
            (s) => s.value === "DEPOSIT_PAID"
          );
        }

        const menuItems = {
          items: availableStatuses.map((status) => ({
            key: status.value,
            label: <Tag color={status.color}>{status.label}</Tag>,
          })),
          onClick: ({ key }) =>
            updatePaymentStatus(record.id, key, paymentStatus),
        };

        return (
          <Dropdown menu={menuItems} disabled={paymentStatus === "FULLY_PAID"}>
            <Button>
              <Tag color={currentStatus?.color || "default"}>
                {currentStatus?.label || "Chưa thanh toán"}
              </Tag>
              <DownOutlined />
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

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      !statusFilter ||
      statusFilter === "ALL" ||
      order.statusName === statusFilter;
    const matchesPayment =
      !paymentStatusFilter ||
      paymentStatusFilter === "ALL" ||
      order.paymentStatus === paymentStatusFilter;
    const matchesSearch = order.name
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    return (
      matchesStatus && matchesPayment && (searchText ? matchesSearch : true)
    );
  });

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>Đơn hàng của khách hàng</h1>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="Lọc theo trạng thái"
            allowClear
            onChange={setStatusFilter}
            defaultValue="ALL"
            options={statusOptionsWithAll.map((status) => ({
              value: status.value,
              label: status.label,
            }))}
          />
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="Lọc theo thanh toán"
            allowClear
            onChange={setPaymentStatusFilter}
            defaultValue="ALL"
            options={paymentStatusOptionsWithAll.map((status) => ({
              value: status.value,
              label: status.label,
            }))}
          />
        </Col>
        <Col>
          <Input
            placeholder="Tìm kiếm theo tên khách hàng"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Col>
      </Row>

      <Table
        columns={columns.filter((column) => !column.hidden)}
        dataSource={filteredOrders}
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
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
            ]}
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
            label="Tng giá tiền"
            rules={[
              { required: true, message: "Vui lòng nhập tổng giá tiền" },
              {
                validator: (_, value) => {
                  if (!value || value >= 5000) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    "Tổng giá tiền phải từ 5,000 VNĐ trở lên"
                  );
                },
              },
            ]}
          >
            <InputNumber
              min={5000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value.replace(/\./g, "")}
            />
          </Form.Item>
          <Form.Item
            name="depositAmount"
            label="Số tiền gửi"
            dependencies={["totalPrice"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  if (value < 5000) {
                    return Promise.reject(
                      "Số tiền gửi phải từ 5,000 VNĐ tr lên"
                    );
                  }
                  const totalPrice = getFieldValue("totalPrice");
                  if (value <= totalPrice) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    "Số tiền gửi không được vượt quá tng giá tiền"
                  );
                },
              }),
            ]}
          >
            <InputNumber
              min={5000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value.replace(/\./g, "")}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
            readOnly
          >
            <DatePicker format="DD/MM/YYYY" readOnly />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
            readOnly
          >
            <DatePicker format="DD/MM/YYYY" readOnly />
          </Form.Item>
          <Form.Item name="customerId" label="Customer ID" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="consultantId" label="Consultant ID" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="createdAt" label="Được tạo ngày" readOnly>
            <Input
              readOnly
              value={moment(form.getFieldValue("createdAt")).format(
                "DD/MM/YYYY HH:mm"
              )}
            />
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
