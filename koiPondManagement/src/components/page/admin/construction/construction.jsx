import React, { useState, useEffect } from 'react';
import { Table, message, Card, Typography, Tag, Space, Progress, Spin, Button } from 'antd';
import api from "../../../config/axios";
import moment from 'moment';

const { Text, Title } = Typography;

const ProjectTasks = () => {
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchConstructorProject();
  }, []);

  const fetchConstructorProject = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects/constructor');
      console.log('Project Info:', response.data);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const project = response.data[0]; // Lấy dự án đầu tiên trong mảng
        setProjectInfo(project);
        if (project.id) {
          await fetchProjectTasks(project.id);
        } else {
          console.error('Project ID is missing');
        }
      } else {
        console.error('Invalid project data received or no projects available');
      }
    } catch (error) {
      console.error('Error fetching constructor project:', error);
      message.error("Failed to load project information");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/project-tasks`);
      console.log('Project Tasks:', response.data);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      message.error("Failed to load project tasks");
      setTasks([]);
    }
  };

  const updateTaskStatus = async (taskId, newPercentage) => {
    try {
      let newStatus;
      if (newPercentage === 0) {
        newStatus = 'pending';
      } else if (newPercentage < 100) {
        newStatus = 'in process';
      } else {
        newStatus = 'COMPLETED';
      }

      // Kiểm tra nếu task đã hoàn thành
      if (tasks.find(task => task.id === taskId)?.status === 'COMPLETED') {
        message.warning('Cannot update a completed task');
        return;
      }

      console.log('Sending data:', { newStatus, completionPercentage: newPercentage });
      await api.patch(`/api/tasks/${taskId}/status?newStatus=${newStatus}&completionPercentage=${newPercentage}`);

      // Refresh tasks after update
      if (projectInfo && projectInfo.id) {
        await fetchProjectTasks(projectInfo.id);
      }

      message.success('Task updated successfully');
    } catch (error) {
      console.error('Error details:', error.response?.data);
      message.error(`Update failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const columns = [
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Project ID',
      dataIndex: 'projectId',
      key: 'projectId',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'green' : 'blue'}>
          {status ? status.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Completion Percentage',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      render: (percentage, record) => (
        <Space>
          <Progress percent={percentage || 0} size="small" />
          {record.status !== 'COMPLETED' && (
            <Button onClick={() => updateTaskStatus(record.id, Math.min((percentage || 0) + 25, 100))}>
              Update
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <Title level={2}>Project Tasks</Title>
      {projectInfo && (
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>{projectInfo.name || 'N/A'}</Title>
          <Text>Description: {projectInfo.description || 'N/A'}</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
            <Text>Overall Progress:</Text>
            <Progress percent={projectInfo.progressPercentage || 0} />
          </Space>
          <Text>Status: {projectInfo.statusName || 'N/A'}</Text>
          <Text>Start Date: {projectInfo.startDate ? moment(projectInfo.startDate).format('YYYY-MM-DD') : 'N/A'}</Text>
          <Text>End Date: {projectInfo.endDate ? moment(projectInfo.endDate).format('YYYY-MM-DD') : 'N/A'}</Text>
        </Card>
      )}
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        locale={{ emptyText: 'No tasks available' }}
      />
    </div>
  );
};

export default ProjectTasks;
