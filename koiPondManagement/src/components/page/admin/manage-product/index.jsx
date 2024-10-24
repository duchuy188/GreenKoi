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
      message.error("Failed to load orders");
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
      message.error(`Failed to load tasks for project ${projectId}`);
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
        message.success("Project cancelled successfully");
        // Cập nhật trạng thái dự án trong danh sách local nếu cần
        setOrders(prevOrders => prevOrders.map(order => 
          order.id === id ? {...order, statusId: response.data.statusId, statusName: response.data.statusName} : order
        ));
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error("Invalid input for project cancellation");
      } else {
        console.error('Error cancelling project:', error);
        message.error("Failed to cancel project");
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
      message.error("Failed to load constructors");
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
        message.success("Constructor assigned successfully");
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
        message.error(`Server error: ${error.response.status}. ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        message.error("Network error. Please check your connection and try again.");
      } else {
        message.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const completeProject = async (id) => {
    try {
      const response = await api.patch(`/api/projects/${id}/complete`);
      if (response.status === 200) {
        message.success("Project completed successfully");
        setOrders(prevOrders => prevOrders.map(order => 
          order.id === id ? {...order, statusId: 'PS6', statusName: 'COMPLETED'} : order
        ));
      }
    } catch (error) {
      console.error('Error completing project:', error);
      message.error("Failed to complete project");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },
    {
      title: 'Deposit Amount',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Consultant ID',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      render: (statusId) => {
        // You might want to map statusId to a readable status name
        return statusId;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to cancel this project?"
            onConfirm={() => cancelProject(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Cancel Project</Button>
          </Popconfirm>
          <Button onClick={() => showAssignModal(record.id)}>Assign Constructor</Button>
          {record.statusId !== 'PS6' && (
            <Popconfirm
              title="Are you sure all tasks are completed and you want to mark this project as complete?"
              onConfirm={() => completeProject(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary">Complete Project</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
    {
      title: 'Tasks Progress',
      key: 'tasksProgress',
      render: (_, record) => {
        const tasks = projectTasks[record.id] || [];
        console.log(`Tasks for project ${record.id}:`, tasks); // Log để kiểm tra
        const completedTasks = tasks.filter(task => task.completionPercentage === 100).length;
        const totalProgress = tasks.reduce((sum, task) => sum + (task.completionPercentage || 0), 0) / tasks.length;
        return (
          <Space direction="vertical">
            <Progress percent={Math.round(totalProgress)} size="small" />
            <Text>{`${completedTasks}/${tasks.length} tasks completed`}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Constructor',
      dataIndex: 'constructorId',
      key: 'constructor',
      render: (constructorId, record) => (
        <span>
          {constructorId ? `${record.constructorName || 'Assigned'}` : 'Not assigned'}
        </span>
      ),
    },
    {
      title: 'Customer Review',
      key: 'customerReview',
      render: (_, record) => {
        const review = projectReviews[record.id];
        console.log(`Rendering review for project ${record.id}:`, review); // Log để kiểm tra
        return review ? (
          <Space>
            <StarOutlined style={{ color: '#fadb14' }} />
            <span>{review.rating} / 5</span>
            <Tooltip title={review.comment}>
              <Button type="link">View Comment</Button>
            </Tooltip>
          </Space>
        ) : (
          <span>No review yet</span>
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
                <Title level={5}>Order {order.id.slice(-4)}</Title>
                <Tag color={getStatusColor(order.statusId)}>{order.statusId}</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button danger size="small">Cancel</Button>
                {order.statusId !== 'P54' && (
                  <Popconfirm
                    title="Are you sure all tasks are completed and you want to mark this project as complete?"
                    onConfirm={() => completeProject(order.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" size="small">Complete</Button>
                  </Popconfirm>
                )}
              </Space>
            }
            hoverable
          >
            <Space direction="vertical" size="small">
              <Text strong><FileTextOutlined /> Name:</Text>
              <Text>{order.name}</Text>
              
              <Text strong><FileTextOutlined /> Description:</Text>
              <Text>{order.description || 'N/A'}</Text>
              
              <Text strong><DollarOutlined /> Total Price:</Text>
              <Text>{order.totalPrice || 0}</Text>
              
              <Text strong><CalendarOutlined /> Created At:</Text>
              <Text>{moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
              
              <Text strong><CalendarOutlined /> Tasks Progress:</Text>
              {projectTasks[order.id] && (
                <>
                  <Progress 
                    percent={Math.round((projectTasks[order.id].filter(task => task.status === 'completed').length / projectTasks[order.id].length) * 100)} 
                    size="small" 
                  />
                  <Text>{`${projectTasks[order.id].filter(task => task.status === 'completed').length}/${projectTasks[order.id].length} tasks completed`}</Text>
                </>
              )}
              
              <Text strong><UserOutlined /> Constructor:</Text>
              <Text>{order.constructorId ? `${order.constructorName || 'Assigned'}` : 'Not assigned'}</Text>
              
              <Text strong><StarOutlined /> Customer Review:</Text>
              {projectReviews[order.id] ? (
                <>
                  <Rate disabled defaultValue={projectReviews[order.id].rating} />
                  <Text>{projectReviews[order.id].comment}</Text>
                </>
              ) : (
                <Text>No review yet</Text>
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
      <h1>Orders List</h1>
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
        title="Assign Constructor"
        visible={isAssignModalVisible}
        onOk={handleAssignConstructor}
        onCancel={() => setIsAssignModalVisible(false)}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a constructor"
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
