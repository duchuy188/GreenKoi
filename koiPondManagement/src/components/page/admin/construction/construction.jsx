import React, { useState, useEffect } from 'react';
import { Table, message, Card, Row, Col, Switch, Button } from 'antd';
import api from '../../../config/axios';

const Construction = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'

  useEffect(() => {
    fetchProjectTasks();
  }, [projectId]);

  const fetchProjectTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/projects/${projectId}/project-tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      message.error('Failed to fetch project tasks');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Task Name',
      dataIndex: 'name',
      key: 'name',
    },
    // Thêm các cột khác tùy theo cấu trúc dữ liệu task của bạn
  ];

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {tasks.map(task => (
        <Col xs={24} sm={12} md={8} lg={6} key={task.id}>
          <Card
            title={`Task ${task.id}`}
            extra={<Button type="primary" size="small">Assign</Button>}
          >
            <p><strong>Name:</strong> {task.name}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Deadline:</strong> {task.deadline}</p>
          </Card>
        </Col>
      ))} 
    </Row>
  );

  return (
    <div>
      <h2>Project Tasks</h2>
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
          dataSource={tasks}
          loading={loading}
          rowKey="id"
        />
      ) : (
        renderCardView()
      )}
    </div>
  );
};

export default Construction;
