import React, { useState, useEffect } from 'react';
import { Table, message, Card, Typography, Tag, Space, Spin, Button, DatePicker } from 'antd';
import api from "../../../config/axios";
import moment from 'moment';
import { toast } from 'react-toastify';

const { Title } = Typography;

const ConstrucMain = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({});
  const [editingIds, setEditingIds] = useState(new Set());

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/maintenance-requests/assigned-to-me');
      
      // Transform the API response to match the expected format
      const transformedData = response.data.map(request => ({
        id: request.id,
        customerId: request.customerId,
        projectId: request.projectId,
        consultantId: request.consultantId,
        description: request.description,
        attachments: request.attachments,
        requestStatus: request.requestStatus || 'PENDING',
        maintenanceStatus: request.maintenanceStatus || 'ASSIGNED',
        agreedPrice: parseFloat(request.agreedPrice || 0),
        scheduledDate: request.scheduledDate ? moment(request.scheduledDate) : null,
        startDate: request.startDate ? moment(request.startDate) : null,
        completionDate: request.completionDate ? moment(request.completionDate) : null
      }));

      setMaintenanceRequests(transformedData);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      message.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMaintenance = async (id, notes, images) => {
    try {
      const response = await api.patch(`/api/maintenance-requests/${id}/complete-maintenance`, {
        maintenanceNotes: notes,
        maintenanceImages: images,
      });
      if (response.status === 200) {
        toast.success("Maintenance marked as completed successfully");
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error completing maintenance:', error);
      message.error("Failed to complete maintenance");
    }
  };

  const handleSubmitDates = async (id) => {
    const dates = selectedDates[id] || {};
    
    if (!dates.scheduledDate || !dates.startDate || !dates.completionDate) {
      message.error("Please select all dates");
      return;
    }

    try {
      const response = await api.patch(`/api/maintenance-requests/${id}/schedule`, {
        scheduledDate: dates.scheduledDate.format('YYYY-MM-DD'),
        startDate: dates.startDate.format('YYYY-MM-DD'),
        completionDate: dates.completionDate.format('YYYY-MM-DD'),
        maintenanceStatus: 'SCHEDULED'
      });

      if (response.status === 200) {
        toast.success("Schedule updated successfully");
        fetchMaintenanceRequests();
        setSelectedDates(prev => ({ ...prev, [id]: {} }));
        setEditingIds(prev => {
          const newIds = new Set(prev);
          newIds.delete(id);
          return newIds;
        });
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      message.error("Failed to update schedule");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Project',
      dataIndex: 'projectId',
      key: 'projectId',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'maintenanceStatus',
      key: 'maintenanceStatus',
      render: (status) => (
        <Tag color={status === 'ASSIGNED' ? 'blue' : 'green'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date, record) => editingIds.has(record.id) ? (
        <DatePicker
          value={selectedDates[record.id]?.scheduledDate}
          onChange={(date) => handleDateChange(date, record.id, 'scheduledDate')}
        />
      ) : (
        date?.format('YYYY-MM-DD') || '-'
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date, record) => editingIds.has(record.id) ? (
        <DatePicker
          value={selectedDates[record.id]?.startDate}
          onChange={(date) => handleDateChange(date, record.id, 'startDate')}
        />
      ) : (
        date?.format('YYYY-MM-DD') || '-'
      ),
    },
    {
      title: 'Completion Date',
      dataIndex: 'completionDate',
      key: 'completionDate',
      render: (date, record) => editingIds.has(record.id) ? (
        <DatePicker
          value={selectedDates[record.id]?.completionDate}
          onChange={(date) => handleDateChange(date, record.id, 'completionDate')}
        />
      ) : (
        date?.format('YYYY-MM-DD') || '-'
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {editingIds.has(record.id) ? (
            <Button onClick={() => handleSubmitDates(record.id)}>Save</Button>
          ) : (
            <Button onClick={() => {
              setEditingIds(prev => new Set(prev).add(record.id));
              setSelectedDates(prev => ({
                ...prev,
                [record.id]: {
                  scheduledDate: record.scheduledDate,
                  startDate: record.startDate,
                  completionDate: record.completionDate,
                },
              }));
            }}>Schedule</Button>
          )}
        </Space>
      ),
    },
  ];

  const handleDateChange = (date, id, dateType) => {
    setSelectedDates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [dateType]: date
      }
    }));
  };

  useEffect(() => {
    fetchMaintenanceRequests();
    const interval = setInterval(fetchMaintenanceRequests, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <Title level={2}>Maintenance Requests</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={maintenanceRequests}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
          }}
        />
      )}
    </Card>
  );
};

export default ConstrucMain;