import React, { useState, useEffect } from 'react';
import { Table, message, Button, Popconfirm, Card, Row, Col, Switch, Typography, Tag, Space, Progress, Modal, Select, Tooltip, Rate } from 'antd';
import api from "../../../config/axios";
import moment from 'moment';
import { CalendarOutlined, DollarOutlined, FileTextOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  const [projectTasks, setProjectTasks] = useState({});
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedConstructorId, setSelectedConstructorId] = useState(null);
  const [constructors, setConstructors] = useState([]);
  const [projectReviews, setProjectReviews] = useState({});

  useEffect(() => {
    fetchOrders();
    fetchConstructors();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects');
      setOrders(response.data);
      // Fetch tasks and reviews for each project
      for (const order of response.data) {
        fetchProjectTasks(order.id, order.constructorId);
        fetchProjectReview(order.id);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProjectTasks = async (projectId, constructorId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/project-tasks?constructorId=${constructorId}`);
      console.log(`Tasks for project ${projectId}:`, response.data); // Log để kiểm tra
      setProjectTasks(prevTasks => ({
        ...prevTasks,
        [projectId]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      message.error(`Không thể tải công việc cho dự án ${projectId}`);
    }
  };

  const fetchProjectReview = async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/reviews`);
      console.log(`Review for project ${projectId}:`, response.data); // Log để kiểm tra
      setProjectReviews(prevReviews => ({
        ...prevReviews,
        [projectId]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching review for project ${projectId}:`, error);
      // Don't show an error message for missing reviews
    }
  };

  const cancelProject = async (id) => {
    try {
      const response = await api.patch(`/api/projects/${id}`, {
        reason: "Cancelled by admin",
        requestedById: "admin" // Thay thế bằng ID admin thực tế
      });
      
      if (response.status === 200) {
        message.success("Đã hủy dự án thành công");
        // Cập nhật trạng thái dự án trong danh sách local nếu cần
        setOrders(prevOrders => prevOrders.map(order => 
          order.id === id ? {...order, statusId: response.data.statusId, statusName: response.data.statusName} : order
        ));
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error("Dữ liệu không hợp lệ để hủy dự án");
      } else {
        console.error('Error cancelling project:', error);
        message.error("Không thể hủy dự án");
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
        const constructorUsers = response.data.filter(user => user.roleId === '4'); // Assuming '4' is the ID for Construction Staff
        setConstructors(constructorUsers.map(user => ({
          id: user.id,
          name: user.fullName || user.username
        })));
      } else {
        throw new Error("Unexpected data structure");
      }
    } catch (error) {
      console.error('Error fetching constructors:', error);
      message.error("Không thể tải danh sách nhà thầu");
    }
  };

  const handleAssignConstructor = async () => {
    try {
      console.log('Sending request with:', {
        projectId: selectedProjectId,
        constructorId: selectedConstructorId
      });

      const response = await api.patch(
        `/api/projects/${selectedProjectId}/assign-constructor?constructorId=${selectedConstructorId}&projectId=${selectedProjectId}`
      );
      
      console.log('Response received:', response);

      if (response.status === 200) {
        message.success("Đã phân công nhà thầu thành công");
        setIsAssignModalVisible(false);
        setOrders(prevOrders => prevOrders.map(order => 
          order.id === selectedProjectId ? {...order, ...response.data} : order
        ));
        
        // Fetch the newly created tasks for this project
        await fetchProjectTasks(selectedProjectId, selectedConstructorId);
        
        fetchOrders();
      }
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);

      if (error.response) {
        message.error(`Lỗi máy chủ: ${error.response.status}. ${error.response.data?.message || 'Lỗi không xác định'}`);
      } else if (error.request) {
        message.error("Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.");
      } else {
        message.error("Đã xảy ra lỗi không mong đợi. Vui lòng thử lại.");
      }
    }
  };

  const completeProject = async (id) => {
    try {
      const response = await api.patch(`/api/projects/${id}/complete`);
      if (response.status === 200) {
        message.success("Đã hoàn thành dự án thành công");
        setOrders(prevOrders => prevOrders.map(order => 
          order.id === id ? {...order, statusId: 'PS6', statusName: 'COMPLETED'} : order
        ));
      }
    } catch (error) {
      console.error('Error completing project:', error);
      message.error("Không thể hoàn thành dự án");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Tổng giá',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },
    {
      title: 'Số tiền đặt cọc',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Mã khách hàng',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Mã tư vấn viên',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusId',
      key: 'statusId',
      render: (statusId) => {
        // You might want to map statusId to a readable status name
        return statusId;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Hành động',
      key: 'actions',
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
          <Button onClick={() => showAssignModal(record.id)}>Phân công nhà thầu</Button>
          {record.statusId !== 'PS6' && (
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
      title: 'Tiến độ công việc',
      key: 'tasksProgress',
      render: (_, record) => {
        const tasks = projectTasks[record.id] || [];
        console.log(`Tasks for project ${record.id}:`, tasks); // Log để kiểm tra
        const completedTasks = tasks.filter(task => task.completionPercentage === 100).length;
        const totalProgress = tasks.reduce((sum, task) => sum + (task.completionPercentage || 0), 0) / tasks.length;
        return (
          <Space direction="vertical">
            <Progress percent={Math.round(totalProgress)} size="small" />
            <Text>{`${completedTasks}/${tasks.length} công việc đã hoàn thành`}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Nhà thầu',
      dataIndex: 'constructorId',
      key: 'constructor',
      render: (constructorId, record) => (
        <span>
          {constructorId ? `${record.constructorName || 'Đã phân công'}` : 'Chưa phân công'}
        </span>
      ),
    },
    {
      title: 'Đánh giá của khách hàng',
      key: 'customerReview',
      render: (_, record) => {
        const review = projectReviews[record.id];
        console.log(`Rendering review for project ${record.id}:`, review); // Log để kiểm tra
        return review ? (
          <Space>
            <StarOutlined style={{ color: '#fadb14' }} />
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
  ];

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {orders.map(order => (
        <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
          <Card
            title={
              <Space>
                <Title level={5}>Đơn hàng {order.id.slice(-4)}</Title>
                <Tag color={getStatusColor(order.statusId)}>{order.statusId}</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button danger size="small">Hủy</Button>
                {order.statusId !== 'P54' && (
                  <Popconfirm
                    title="Bạn có chắc chắn rằng tất cả công việc đã hoàn thành và muốn đánh dấu dự án này là hoàn thành không?"
                    onConfirm={() => completeProject(order.id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="primary" size="small">Hoàn thành</Button>
                  </Popconfirm>
                )}
              </Space>
            }
            hoverable
          >
            <Space direction="vertical" size="small">
              <Text strong><FileTextOutlined /> Tên:</Text>
              <Text>{order.name}</Text>
              
              <Text strong><FileTextOutlined /> Mô tả:</Text>
              <Text>{order.description || 'Không có'}</Text>
              
              <Text strong><DollarOutlined /> Tổng giá:</Text>
              <Text>{order.totalPrice || 0}</Text>
              
              <Text strong><CalendarOutlined /> Ngày tạo:</Text>
              <Text>{moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
              
              <Text strong><CalendarOutlined /> Tiến độ công việc:</Text>
              {projectTasks[order.id] && (
                <>
                  <Progress 
                    percent={Math.round((projectTasks[order.id].filter(task => task.status === 'completed').length / projectTasks[order.id].length) * 100)} 
                    size="small" 
                  />
                  <Text>{`${projectTasks[order.id].filter(task => task.status === 'completed').length}/${projectTasks[order.id].length} công việc đã hoàn thành`}</Text>
                </>
              )}
              
              <Text strong><UserOutlined /> Nhà thầu:</Text>
              <Text>{order.constructorId ? `${order.constructorName || 'Đã phân công'}` : 'Chưa phân công'}</Text>
              
              <Text strong><StarOutlined /> Đánh giá của khách hàng:</Text>
              {projectReviews[order.id] ? (
                <>
                  <Rate disabled defaultValue={projectReviews[order.id].rating} />
                  <Text>{projectReviews[order.id].comment}</Text>
                </>
              ) : (
                <Text>Chưa có đánh giá</Text>
              )}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'P51':
        return 'processing';
      case 'P52':
        return 'warning';
      case 'P54':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>View mode:</span>
        <Switch
          checkedChildren="Card"
          unCheckedChildren="List"
          checked={viewMode === 'card'}
          onChange={(checked) => setViewMode(checked ? 'card' : 'list')}
        />
      </div>
      {viewMode === 'list' ? (
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
        />
      ) : (
        renderCardView()
      )}
      <Modal
        title="Phân công nhà thầu"
        visible={isAssignModalVisible}
        onOk={handleAssignConstructor}
        onCancel={() => setIsAssignModalVisible(false)}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn một nhà thầu"
          onChange={(value) => setSelectedConstructorId(value)}
          loading={constructors.length === 0}
        >
          {constructors.map(constructor => (
            <Option key={constructor.id} value={constructor.id}>{constructor.name}</Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default OrdersList;
