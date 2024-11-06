import React, { useState, useEffect } from "react";
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
  const [isPolling, setIsPolling] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    initialFetch();
    
    const pollingInterval = setInterval(() => {
      pollOrders();
    }, 10000); // Poll every 30 seconds
    
    return () => clearInterval(pollingInterval);
  }, []);

  const initialFetch = async () => {
    try {
      setInitialLoading(true);
      await fetchOrders(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const pollOrders = async () => {
    try {
      setIsPolling(true);
      await fetchOrders(false);
    } finally {
      setIsPolling(false);
    }
  };

  const fetchOrders = async (isInitialFetch) => {
    try {
      const response = await api.get("/api/projects");
      if (response.data) {
        setOrders(prevOrders => {
          const newOrders = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          if (JSON.stringify(prevOrders) !== JSON.stringify(newOrders)) {
            if (!isInitialFetch) {
              newOrders.forEach(order => {
                if (!prevOrders.find(po => po.id === order.id)) {
                  toast.info(`Có đơn hàng mới: ${order.name}`);
                }
              });
            }
            return newOrders;
          }
          return prevOrders;
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!isInitialFetch) {
        toast.error(
          error.response?.data?.message || 
          "Không thể tải danh sách đơn hàng"
        );
      }
    }
  };

  const fetchProjectTasks = async (projectId, constructorId) => {
    try {
      const response = await api.get(
        `/api/projects/${projectId}/project-tasks?constructorId=${constructorId}`
      );
      //console.log(`Tasks for project ${projectId}:`, response.data); // Log để kiểm tra
      setProjectTasks((prevTasks) => ({
        ...prevTasks,
        [projectId]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      toast.error(`Không thể tải công việc cho dự án ${projectId}`);
    }
  };

  const fetchProjectReview = async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/reviews`);
      setProjectReviews((prevReviews) => ({
        ...prevReviews,
        [projectId]: response.data,
      }));
    } catch (error) {
      if (error.response?.status === 404) {
        setProjectReviews((prevReviews) => ({
          ...prevReviews,
          [projectId]: null,
        }));
      } else {
        console.error(`Error fetching review for project ${projectId}:`, error);
      }
    }
  };
  const statusOptions = [
    { value: "PENDING", label: "Chờ duyệt", color: "orange" },
    { value: "APPROVED", label: "Đã duyệt", color: "green" },
    { value: "PLANNING", label: "Đang lên kế hoạch", color: "blue" },
    { value: "IN_PROGRESS", label: "Đang thực hiện", color: "processing" },
    { value: "ON_HOLD", label: "Tạm dừng", color: "warning" },
    { value: "CANCELLED", label: "Đã hủy", color: "red" },
    { value: "MAINTENANCE", label: "Bảo trì", color: "cyan" },
    { value: "COMPLETED", label: "Hoàn thành", color: "success" },
    { value: "TECHNICALLY_COMPLETED", label: "Đã hoàn thành kỹ thuật", color: "lime" },
  ];
  const cancelProject = async (id) => {
    try {
      const response = await api.patch(`/api/projects/${id}/cancel`, {
        reason: "Cancelled by admin",
        requestedById: "admin", // Thay thế bằng ID admin thực tế
      });

      if (response.status === 200) {
        toast.success("Đã hủy dự án thành công");
        // Cập nhật trạng thái dự án trong danh sách local nếu cần
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

        // Cập nhật danh sách orders
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedProjectId
              ? { ...order, ...response.data }
              : order
          )
        );

        // Fetch tasks và refresh orders
        await fetchProjectTasks(selectedProjectId, selectedConstructorId);
        await fetchOrders();

        // Reset các state liên quan
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
      }
    } catch (error) {
      console.error("Error completing project:", error);
      if (error.response?.status === 400) {
        toast.error(
          "Dự án phải được thanh toán đầy đủ trước khi đánh dấu hoàn thành"
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
      render: (text, record) => {
        // Tạo một div tạm thời để parse HTML và lấy text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        const plainText = tempDiv.textContent || tempDiv.innerText;
        const shortDescription =
          plainText.length > 50 ? plainText.slice(0, 50) + "..." : plainText;

        return (
          <>
            <span>{shortDescription}</span>
            {plainText.length > 50 && (
              <Button
                type="link"
                onClick={() => toggleDescription(record.id, text)}
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
      render: (price) => price?.toLocaleString('vi-VN') + ' VND'
    },
    {
      title: "Số tiền đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      render: (price) => price?.toLocaleString('vi-VN') + ' VND'
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
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
          <Button onClick={() => showAssignModal(record.id)}>
            Phân công nhân viên xây dựng
          </Button>
          {record.statusId !== "PS6" && (
            <Popconfirm
              title="Bạn có chắc chắn rằng tất cả công việc đã hoàn thành và muốn đánh dấu dự án này là hoàn thành không?"
              onConfirm={() => completeProject(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                onClick={() => completeProject(record.id)}
                loading={actionLoading}
                type="primary"
              >
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
        //console.log(`Tasks for project ${record.id}:`, tasks); // Log để kiểm tra
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
          <Space>
            <StarOutlined style={{ color: "#fadb14" }} />
            <span>{review.rating} / 5</span>
            <Tooltip title={review.comment}>
              <Button type="link">Xem bình luận</Button>
            </Tooltip>
          </Space>
        ) : (
          <span>Chưa có đánh giá</span>
        );
      },
    },
    {
      title: 'Trạng thái thanh toán',
      key: 'paymentStatus',
      render: (_, record) => {
        // Kiểm tra trạng thái thanh toán từ record
        if (record.paymentStatus === 'FULLY_PAID') {
          return (
            <Space direction="vertical">
              <Tag color="green">Đã thanh toán</Tag>
            
              <Text>{`${record.totalPrice.toLocaleString()} VND`}</Text>
            </Space>
          );
        }

        if (record.paymentStatus === 'DEPOSIT_PAID') {
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

        // UNPAID or default case
        return (
          <Space direction="vertical">
            <Tag color="red">Chưa thanh toán</Tag>
            <Text>{`0 / ${record.totalPrice.toLocaleString()} VND`}</Text>
          </Space>
        );
      },
    },
  ];

  // Lọc danh sách nhà thầu theo tìm kiếm
  const filteredConstructors = constructors.filter((constructor) => {
    // Kiểm tra xem constructor có đang làm dự án nào chưa hoàn thành không
    const activeProject = orders.find(
      (order) =>
        order.constructorId === constructor.id && order.statusId !== "PS6" // Chỉ kiểm tra các dự án chưa hoàn thành
    );

    const matchesSearch = constructor.name
      .toLowerCase()
      .includes(searchConstructor.toLowerCase());

    // Constructor có thể được chọn nếu không có dự án đang hoạt động và phù hợp với tìm kiếm
    return !activeProject && matchesSearch;
  });

  // Cập nhật Modal phân công
  const renderAssignModal = () => (
    <Modal
      title={<div className="assign-modal-title">Phân công nhân viên xây dựng</div>}
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
                    Chưa có dự án nào
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
    <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
      <div>
        <span style={{ marginRight: 8 }}>Lọc theo trạng thái:</span>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn trạng thái"
          allowClear
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
        >
          {statusOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );

  const filteredOrders = orders.filter(order => {
    if (!statusFilter) return true;
    return order.statusName === statusFilter;
  });

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>
      {renderFilters()}
      <Table
        columns={columns}
        dataSource={filteredOrders}
        loading={initialLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      {renderAssignModal()}
      {renderDescriptionModal()}
    </div>
  );
};

export default OrdersList;
