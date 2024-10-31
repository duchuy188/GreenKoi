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
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'card'
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

  useEffect(() => {
    fetchOrders();
    fetchConstructors();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/projects");
      // Sort orders by createdAt in descending order (newest first)
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
      // Fetch tasks for each project
      for (const order of sortedOrders) {
        fetchProjectTasks(order.id, order.constructorId);
        // Only fetch reviews for completed projects
        if (order.statusId === "PS6") {
          fetchProjectReview(order.id);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
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
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "PLANNING", label: "Đang lên kế hoạch" },
    { value: "IN_PROGRESS", label: "Đang thực hiện" },
    { value: "ON_HOLD", label: "Tạm dừng" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "MAINTENANCE", label: "Bảo trì" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "TECHNICALLY_COMPLETED", label: "Đã hoàn thành kỹ thuật" },
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
      toast.error("Không thể tải danh sách nhà thầu");
    }
  };

  const handleAssignConstructor = async () => {
    try {
      const response = await api.patch(
        `/api/projects/${selectedProjectId}/assign-constructor?constructorId=${selectedConstructorId}&projectId=${selectedProjectId}`
      );

      if (response.status === 200) {
        toast.success("Đã phân công nhà thầu thành công");
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
      const response = await api.patch(`/api/projects/${id}/complete`);
      if (response.status === 200) {
        toast.success("Đã hoàn thành dự án thành công");
        setOrders((prevOrders) => {
          const updatedOrders = prevOrders.map((order) =>
            order.id === id
              ? { ...order, statusId: "PS6", statusName: "COMPLETED" }
              : order
          );
          return updatedOrders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        });
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
      visible={isDescriptionModalVisible}
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
    },
    {
      title: "Số tiền đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
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
        return status ? status.label : statusName;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
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
            Phân công nhà thầu
          </Button>
          {record.statusId !== "PS6" && (
            <Popconfirm
              title="Bạn có chắc chắn rằng tất cả công việc đã hoàn thành và muốn đánh dấu dự án này là hoàn thành không?"
              onConfirm={() => completeProject(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary">Hoàn thành dự án</Button>
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
      title: "Nhà thầu",
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

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {orders.map((order, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
          <Card
            title={
              <Space>
                <Title level={5}>Đơn hàng {index + 1}</Title>
                <Tag color={getStatusColor(order.statusId)}>
                  {order.statusId}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                <Button danger size="small">
                  Hủy
                </Button>
                {order.statusId !== "P54" && (
                  <Popconfirm
                    title="Bạn có chắc chắn rằng tất cả công việc đã hoàn thành và muốn đánh dấu dự án này là hoàn thành không?"
                    onConfirm={() => completeProject(order.id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="primary" size="small">
                      Hoàn thành
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            }
            hoverable
          >
            <Space direction="vertical" size="small">
              <Text strong>
                <FileTextOutlined /> Tên:
              </Text>
              <Text>{order.name}</Text>

              <Text strong>
                <FileTextOutlined /> Mô tả:
              </Text>
              {(() => {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = order.description;
                const plainText = tempDiv.textContent || tempDiv.innerText;
                return (
                  <>
                    <Text>
                      {plainText.length > 50
                        ? plainText.slice(0, 50) + "..."
                        : plainText}
                    </Text>
                    {plainText.length > 50 && (
                      <Button
                        type="link"
                        onClick={() =>
                          toggleDescription(order.id, order.description)
                        }
                      >
                        Xem thêm
                      </Button>
                    )}
                  </>
                );
              })()}

              <Text strong>
                <DollarOutlined /> Tổng giá:
              </Text>
              <Text>{order.totalPrice || 0}</Text>

              <Text strong>
                <CalendarOutlined /> Ngày tạo:
              </Text>
              <Text>
                {moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </Text>

              <Text strong>
                <CalendarOutlined /> Tiến độ công việc:
              </Text>
              {projectTasks[order.id] && (
                <>
                  <Progress
                    percent={Math.round(
                      (projectTasks[order.id].filter(
                        (task) => task.status === "completed"
                      ).length /
                        projectTasks[order.id].length) *
                        100
                    )}
                    size="small"
                  />
                  <Text>{`${
                    projectTasks[order.id].filter(
                      (task) => task.status === "completed"
                    ).length
                  }/${
                    projectTasks[order.id].length
                  } công việc đã hoàn thành`}</Text>
                </>
              )}

              <Text strong>
                <UserOutlined /> Nhà thầu:
              </Text>
              <Text>
                {order.constructorId
                  ? `${order.constructorName || "Đã phân công"}`
                  : "Chưa phân công"}
              </Text>

              <Text strong>
                <StarOutlined /> Đnh giá của khách hàng:
              </Text>
              {order.statusId === "PS6" ? (
                projectReviews[order.id] ? (
                  <>
                    <Rate
                      disabled
                      defaultValue={projectReviews[order.id].rating}
                    />
                    <Text>{projectReviews[order.id].comment}</Text>
                  </>
                ) : (
                  <Text>Chưa có đánh giá</Text>
                )
              ) : (
                <Text>Chưa hoàn thành</Text>
              )}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "P51":
        return "processing";
      case "P52":
        return "warning";
      case "P54":
        return "success";
      default:
        return "default";
    }
  };

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
      title={<div className="assign-modal-title">Phân công nhà thầu</div>}
      visible={isAssignModalVisible}
      onCancel={() => {
        setIsAssignModalVisible(false);
        setSelectedConstructor(null);
        setSearchConstructor("");
      }}
      onOk={() => {
        if (!selectedConstructor) {
          toast.warning("Vui lòng chọn nhà thầu");
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
          placeholder="Tìm kiếm nhà thầu..."
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
                  ? "Không tìm thấy nhà thầu phù hợp"
                  : "Không có nhà thầu"
              }
            />
          )}
        </div>
      </div>
    </Modal>
  );

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>Chế độ xem:</span>
        <Switch
          checkedChildren="Thẻ"
          unCheckedChildren="Danh sách"
          checked={viewMode === "card"}
          onChange={(checked) => setViewMode(checked ? "card" : "list")}
        />
      </div>
      {viewMode === "list" ? (
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
        />
      ) : (
        renderCardView()
      )}
      {renderAssignModal()}
      {renderDescriptionModal()}
    </div>
  );
};

export default OrdersList;
