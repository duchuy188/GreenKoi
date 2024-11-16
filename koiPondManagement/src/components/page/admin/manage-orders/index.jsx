import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Card,
  Row,
  Col,
  Switch,
  Typography,
  Tag,
  Space,
  Progress,
  Modal,
  Select,
  Tooltip,
  Rate,
  Input,
  Empty,
} from "antd";
import api from "../../../config/axios";
import moment from "moment";
import {
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  StarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./assignModal.css";
import { toast } from "react-toastify";

const { Text, Title } = Typography;
const { Option } = Select;

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectTasks, setProjectTasks] = useState({});
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedConstructorId, setSelectedConstructorId] = useState(null);
  const [constructors, setConstructors] = useState([]);
  const [projectReviews, setProjectReviews] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [searchConstructor, setSearchConstructor] = useState("");
  const [selectedConstructor, setSelectedConstructor] = useState(null);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    initialFetch();
    fetchConstructors();
  }, []);

  useEffect(() => {
    orders.forEach((order) => {
      if (order.statusId === "PS6") {
        fetchProjectReview(order.id);
      }
    });
  }, [orders]);

  const initialFetch = async () => {
    try {
      setInitialLoading(true);
      await fetchOrders(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchOrders = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }

      const response = await api.get("/api/projects");

      if (response.data) {
        const newOrders = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

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

  const fetchProjectTasks = async (
    projectId,
    constructorId,
    retryCount = 3
  ) => {
    try {
      const response = await api.get(
        `/api/projects/${projectId}/project-tasks?constructorId=${constructorId}`
      );

      if (response.data) {
        setProjectTasks((prevTasks) => {
          const newTasks = response.data;
          const currentTasks = prevTasks[projectId] || [];

          if (JSON.stringify(currentTasks) !== JSON.stringify(newTasks)) {
            return {
              ...prevTasks,
              [projectId]: newTasks,
            };
          }
          return prevTasks;
        });
      }
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      if (retryCount > 0) {
        setTimeout(() => {
          fetchProjectTasks(projectId, constructorId, retryCount - 1);
        }, 1000);
      } else {
        // toast.error(`Không thể tải công việc cho dự án ${projectId}`);
      }
    }
  };

  const fetchProjectReview = async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/reviews`);
      if (response.data) {
        setProjectReviews((prevReviews) => ({
          ...prevReviews,
          [projectId]: response.data,
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setProjectReviews((prevReviews) => ({
          ...prevReviews,
          [projectId]: null,
        }));
      } else {
        // console.error(`Error fetching review for project ${projectId}:`, error);
      }
    }
  };
  const statusOptions = [
    { value: "ALL", label: "Tất cả", color: "default" },
    { value: "PENDING", label: "Chờ duyệt", color: "orange" },
    { value: "APPROVED", label: "Đã duyệt", color: "green" },
    { value: "PLANNING", label: "Đang lên kế hoạch", color: "blue" },
    { value: "IN_PROGRESS", label: "Đang thực hiện", color: "processing" },
    { value: "ON_HOLD", label: "Tạm dừng", color: "warning" },
    { value: "CANCELLED", label: "Đã hủy", color: "red" },
    { value: "MAINTENANCE", label: "Bảo trì", color: "cyan" },
    { value: "COMPLETED", label: "Hoàn thành", color: "success" },
    {
      value: "TECHNICALLY_COMPLETED",
      label: "Đã hoàn thành kỹ thuật",
      color: "lime",
    },
  ];
  const cancelProject = async (id) => {
    try {
      const response = await api.patch(`/api/projects/${id}/cancel`, {
        reason: "Cancelled by admin",
        requestedById: "admin", // Thay thế bằng ID admin thực tế
      });

      if (response.status === 200) {
        toast.success("Đã hủy dự án thành công");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  statusId: response.data.statusId,
                  statusName: response.data.statusName,
                }
              : order
          )
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("Dữ liệu không hợp lệ để hủy dự án");
      } else {
        console.error("Error cancelling project:", error);
        toast.error("Không thể hủy dự án");
      }
    }
  };

  const showAssignModal = (projectId) => {
    setSelectedProjectId(projectId);
    setIsAssignModalVisible(true);
    fetchConstructors();
  };

  const fetchConstructors = async () => {
    try {
      const response = await api.get("/api/manager/users");
      if (Array.isArray(response.data)) {
        const constructorUsers = response.data.filter(
          (user) => user.roleId === "4"
        ); // Assuming '4' is the ID for Construction Staff
        setConstructors(
          constructorUsers.map((user) => ({
            id: user.id,
            name: user.fullName || user.username,
          }))
        );
      } else {
        throw new Error("Unexpected data structure");
      }
    } catch (error) {
      console.error("Error fetching constructors:", error);
      toast.error("Không thể tải danh sách nhân viên xây dựng");
    }
  };

  const handleAssignConstructor = async () => {
    try {
      const response = await api.patch(
        `/api/projects/${selectedProjectId}/assign-constructor?constructorId=${selectedConstructorId}&projectId=${selectedProjectId}`
      );

      if (response.status === 200) {
        toast.success("Đã phân công nhân viên xây dựng thành công");
        setIsAssignModalVisible(false);

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedProjectId
              ? { ...order, ...response.data }
              : order
          )
        );

        await fetchProjectTasks(selectedProjectId, selectedConstructorId);
        await fetchOrders();

        setSelectedConstructor(null);
        setSelectedConstructorId(null);
        setSearchConstructor("");
      }
    } catch (error) {
      console.error("Detailed error:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);

      if (error.response) {
        toast.error(
          `Lỗi máy chủ: ${error.response.status}. ${
            error.response.data?.message || "Lỗi không xác định"
          }`
        );
      } else if (error.request) {
        toast.error("Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.");
      } else {
      }
    }
  };

  const completeProject = async (id) => {
    try {
      setActionLoading(true);
      const response = await api.patch(`/api/projects/${id}/complete`);
      if (response.status === 200) {
        toast.success("Đã hoàn thành dự án thành công");

        await fetchOrders(false);

        const project = orders.find((order) => order.id === id);
        if (project?.constructorId) {
          await fetchProjectTasks(id, project.constructorId);
        }
      }
    } catch (error) {
      console.error("Error completing project:", error);
      if (error.response?.status === 400) {
        toast.error(
          "Dự án phải được hoàn thành kỹ thuật trước khi đánh dấu là đã thanh toán đầy đủ"
        );
      } else {
        toast.error("Không thể hoàn thành dự án");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getConstructorName = (constructorId) => {
    const constructor = constructors.find((c) => c.id === constructorId);
    return constructor ? constructor.name : "Không xác định";
  };

  const toggleDescription = (orderId, description) => {
    setSelectedDescription(description);
    setIsDescriptionModalVisible(true);
  };

  const renderDescriptionModal = () => (
    <Modal
      title="Chi tiết mô tả"
      open={isDescriptionModalVisible}
      onCancel={() => setIsDescriptionModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setIsDescriptionModalVisible(false)}>
          Đóng
        </Button>,
      ]}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: selectedDescription,
        }}
        style={{
          padding: "16px",
          maxHeight: "60vh",
          overflowY: "auto",
          lineHeight: "1.6",
        }}
      />
    </Modal>
  );

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text, record) => (
        <Button type="link" onClick={() => toggleDescription(record.id, text)}>
          Xem chi tiết
        </Button>
      ),
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => price?.toLocaleString("vi-VN") + " VNĐ",
    },
    {
      title: "Số tiền đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      render: (price) => price?.toLocaleString("vi-VN") + " VNĐ",
    },
    {
      title: "NGÀY BẮT ĐẦU",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("DD-MM-YYYY"),
    },
    {
      title: "NGÀY KẾT THÚC",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => moment(date).format("DD-MM-YYYY"),
    },
    {
      title: "Mã khách hàng",
      dataIndex: "customerId",
      key: "customerId",
      hidden: true,
    },
    {
      title: "Mã tư vấn viên",
      dataIndex: "consultantId",
      key: "consultantId",
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
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Bạn có chắc chắn muốn hủy dự án này không?"
            onConfirm={() => cancelProject(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Hủy dự án</Button>
          </Popconfirm>

          {record.statusId !== "PS6" &&
            record.statusId !== "PS7" &&
            !record.constructorId && (
              <Button onClick={() => showAssignModal(record.id)}>
                Phân công nhân viên xây dựng
              </Button>
            )}

          {record.statusId !== "PS6" && (
            <Popconfirm
              title="Bạn có chắc chắn rằng tất cả công việc đã hoàn thành và muốn đánh dấu dự án này là hoàn thành không?"
              onConfirm={() => completeProject(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button loading={actionLoading} type="primary">
                Hoàn thành
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
    {
      title: "Tiến độ công việc",
      key: "tasksProgress",
      render: (_, record) => {
        const tasks = projectTasks[record.id] || [];

        if (!record.constructorId) {
          return <Text type="secondary">Chưa phân công nhân viên</Text>;
        }

        if (tasks.length === 0) {
          fetchProjectTasks(record.id, record.constructorId);
          return <Text type="secondary">Đang tải công việc...</Text>;
        }

        const completedTasks = tasks.filter(
          (task) => task.completionPercentage === 100
        ).length;
        const totalProgress =
          tasks.reduce(
            (sum, task) => sum + (task.completionPercentage || 0),
            0
          ) / tasks.length;

        return (
          <Space direction="vertical">
            <Progress percent={Math.round(totalProgress)} size="small" />
            <Text>{`${completedTasks}/${tasks.length} công việc đã hoàn thành`}</Text>
          </Space>
        );
      },
    },
    {
      title: "Nhân viên xây dựng",
      dataIndex: "constructorId",
      key: "constructor",
      render: (constructorId) => (
        <span>
          {constructorId ? getConstructorName(constructorId) : "Chưa phân công"}
        </span>
      ),
    },
    {
      title: "Đánh giá của khách hàng",
      key: "customerReview",
      render: (_, record) => {
        if (record.statusId !== "PS6") {
          return <span>Chưa hoàn thành</span>;
        }
        const review = projectReviews[record.id];
        return review ? (
          <Button
            type="link"
            onClick={() => {
              setSelectedReview(review);
              setIsReviewModalVisible(true);
            }}
          >
            <Space>
              <StarOutlined style={{ color: "#fadb14" }} />
              <span>{review.rating}/5</span>
            </Space>
          </Button>
        ) : (
          <span>Chưa có đánh giá</span>
        );
      },
    },
    {
      title: "Trạng thái thanh toán",
      key: "paymentStatus",
      render: (_, record) => {
        if (record.paymentStatus === "FULLY_PAID") {
          return (
            <Space direction="vertical">
              <Tag color="green">Đã thanh toán</Tag>

              <Text>{`${record.totalPrice.toLocaleString()} VND`}</Text>
            </Space>
          );
        }

        if (record.paymentStatus === "DEPOSIT_PAID") {
          const paidAmount = record.depositAmount || 0;
          const totalAmount = record.totalPrice || 0;
          const paymentPercentage = (paidAmount / totalAmount) * 100;

          return (
            <Space direction="vertical">
              <Tag color="orange">Đã đặt cọc</Tag>

              <Text>{`${paidAmount.toLocaleString()} / ${totalAmount.toLocaleString()} VND`}</Text>
            </Space>
          );
        }

        return (
          <Space direction="vertical">
            <Tag color="red">Chưa thanh toán</Tag>
            <Text>{`0 / ${record.totalPrice.toLocaleString()} VND`}</Text>
          </Space>
        );
      },
    },
  ];

  const filteredConstructors = constructors.filter((constructor) => {
    const activeProject = orders.find(
      (order) =>
        order.constructorId === constructor.id && 
        order.statusId !== "PS6" && // Completed
        order.statusId !== "PS7"    // Cancelled
    );

    const matchesSearch = constructor.name
      .toLowerCase()
      .includes(searchConstructor.toLowerCase());

    return !activeProject && matchesSearch;
  });

  const renderAssignModal = () => (
    <Modal
      title={
        <div className="assign-modal-title">Phân công nhân viên xây dựng</div>
      }
      open={isAssignModalVisible}
      onCancel={() => {
        setIsAssignModalVisible(false);
        setSelectedConstructor(null);
        setSearchConstructor("");
      }}
      onOk={() => {
        if (!selectedConstructor) {
          toast.warning("Vui lòng chọn nhân viên xây dựng");
          return;
        }
        handleAssignConstructor();
      }}
      okText="Xác nhận phân công"
      cancelText="Hủy"
      width={500}
    >
      <div className="assign-modal-content">
        <Input.Search
          placeholder="Tìm kiếm nhân viên xây dựng..."
          className="search-box"
          value={searchConstructor}
          onChange={(e) => setSearchConstructor(e.target.value)}
          allowClear
        />

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {filteredConstructors.length > 0 ? (
            filteredConstructors.map((constructor) => (
              <div
                key={constructor.id}
                className={`constructor-item ${
                  selectedConstructor?.id === constructor.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedConstructor(constructor);
                  setSelectedConstructorId(constructor.id);
                }}
              >
                <div className="constructor-avatar">
                  {constructor.name.charAt(0).toUpperCase()}
                </div>
                <div className="constructor-info">
                  <Typography.Text strong>{constructor.name}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {orders.some(order => order.constructorId === constructor.id && order.statusId === "PS7") 
                      }
                  </Typography.Text>
                </div>
                {selectedConstructor?.id === constructor.id && (
                  <Tag color="blue">Đã chọn</Tag>
                )}
              </div>
            ))
          ) : (
            <Empty
              description={
                searchConstructor
                  ? "Không tìm thấy nhân viên xây dựng phù hợp"
                  : "Không có nhân viên xây dựng"
              }
            />
          )}
        </div>
      </div>
    </Modal>
  );

  const renderFilters = () => (
    <div
      style={{
        marginBottom: 16,
        display: "flex",
        gap: 16,
        alignItems: "center",
      }}
    >
      <div>
        <span style={{ marginRight: 8 }}>Lọc theo trạng thái:</span>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn trạng thái"
          allowClear
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
        >
          {statusOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );

  const filteredOrders = orders.filter((order) => {
    if (!statusFilter || statusFilter === "ALL") return true;
    return order.statusName === statusFilter;
  });

  const renderReviewModal = () => (
    <Modal
      title="Đánh giá của khách hàng"
      open={isReviewModalVisible}
      onCancel={() => setIsReviewModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setIsReviewModalVisible(false)}>
          Đóng
        </Button>,
      ]}
    >
      {selectedReview && (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Rate disabled value={selectedReview.rating} />
            <Text style={{ marginLeft: 8 }}>{selectedReview.rating}/5</Text>
          </div>
          <div>
            <Text strong>Nhận xét:</Text>
            <p>{selectedReview.comment}</p>
          </div>
        </Space>
      )}
    </Modal>
  );

  useEffect(() => {
    fetchOrders();
    fetchConstructors();

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

  useEffect(() => {
    orders.forEach((order) => {
      if (order.constructorId) {
        fetchProjectTasks(order.id, order.constructorId);
      }
    });
  }, [orders]);

  useEffect(() => {
    const pollReviews = async () => {
      const completedOrders = orders.filter(
        (order) => order.statusId === "PS6"
      );
      for (const order of completedOrders) {
        await fetchProjectReview(order.id);
      }
    };

    const intervalId = setInterval(pollReviews, 30000);

    pollReviews();

    return () => clearInterval(intervalId);
  }, [orders]);

  const togglePolling = () => {
    setIsPollingEnabled((prev) => !prev);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Danh sách đơn hàng</h1>
      </div>

      {renderFilters()}
      <Table
        columns={columns}
        dataSource={filteredOrders}
        loading={initialLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
      />
      {renderAssignModal()}
      {renderDescriptionModal()}
      {renderReviewModal()}
    </div>
  );
};

export default OrdersList;
