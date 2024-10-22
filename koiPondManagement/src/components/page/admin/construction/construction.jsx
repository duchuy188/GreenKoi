import React, { useState, useEffect } from 'react';
import { Table, message, Card, Typography, Tag, Space, Progress, Alert } from 'antd';
import api from "../../../config/axios";

const { Text, Title } = Typography;

const Construction = ({ projectId }) => {
  if (!projectId) {
    return <div>Error: No project ID provided</div>;
  }

  console.log('Construction component received projectId:', projectId);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided. Please select a valid project.');
      setLoading(false);
      return;
    }

    fetchProjectTasks(projectId);
  }, [projectId]);

  const fetchProjectTasks = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/projects/${id}/project-tasks`);
      setTasks(response.data);
      setProjectDetails(response.data.length > 0 ? response.data[0].project : null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'blue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Completion Percentage',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      render: (percentage) => (
        <Progress percent={percentage} size="small" />
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Title level={3}>Construction Tasks</Title>
        {projectDetails && (
          <Space direction="vertical" style={{ marginBottom: 16 }}>
            <Text strong>Project: {projectDetails.name}</Text>
            <Text>Description: {projectDetails.description}</Text>
          </Space>
        )}
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default Construction;
