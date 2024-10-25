import React, { useState, useEffect } from 'react';
import { Table, message, Card, Typography, Tag, Space, Spin, Button, DatePicker, Modal, Form, Input, Upload } from 'antd';
import api from "../../../config/axios";
import moment from 'moment';
import { toast } from 'react-toastify';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ConstrucMain = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({});
  const [editingIds, setEditingIds] = useState(new Set());
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [maintenanceImages, setMaintenanceImages] = useState([]);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/maintenance-requests/assigned-to-me');
      
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
        completionDate: request.completionDate ? moment(request.completionDate) : null,
        maintenanceNotes: request.maintenanceNotes,
        maintenanceImages: request.maintenanceImages,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        assignedTo: request.assignedTo || '',
      }));

      setMaintenanceRequests(transformedData);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      message.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStartMaintenance = async (id) => {
    try {
      const response = await api.patch(`/api/maintenance-requests/${id}/start-maintenance`, {
        maintenanceStatus: 'IN_PROGRESS'
      });
      if (response.status === 200) {
        toast.success("Maintenance process started successfully");
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error starting maintenance:', error);
      message.error("Failed to start maintenance");
    }
  };

  const handleSubmitDates = async (id) => {
    const dates = selectedDates[id] || {};
    
    if (!dates.scheduledDate) {
      message.error("Please select scheduled date");
      return;
    }

    try {
      const response = await api.patch(`/api/maintenance-requests/${id}/schedule`, {
        scheduledDate: dates.scheduledDate.format('YYYY-MM-DD'),
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

  const showCompleteModal = (id) => {
    setSelectedMaintenanceId(id);
    setIsCompleteModalVisible(true);
  };

  const handleCompleteMaintenance = async () => {
    try {
      // Validate
      if (!maintenanceNotes.trim()) {
        message.error("Please enter maintenance notes");
        return;
      }

      if (maintenanceImages.length === 0) {
        message.error("Please upload at least one image");
        return;
      }

      // Convert maintenanceImages to array of strings (URLs or base64)
      const imageUrls = await Promise.all(
        maintenanceImages.map(async (file) => {
          if (file.originFileObj) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file.originFileObj);
              reader.onload = () => resolve(reader.result);
              reader.onerror = error => reject(error);
            });
          }
          return file.url; 
        })
      );

      const requestBody = {
        maintenanceNotes: maintenanceNotes,
        maintenanceImages: imageUrls,
        additionalProps1: [],
        additionalProps2: [],
        additionalProps3: []
      };

      const response = await api.patch(
        `/api/maintenance-requests/${selectedMaintenanceId}/complete-maintenance`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success("Maintenance completed successfully");
        setIsCompleteModalVisible(false);
        setMaintenanceNotes('');
        setMaintenanceImages([]);
        setSelectedMaintenanceId(null);
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error completing maintenance:', error);
      message.error(error.response?.data?.message || "Failed to complete maintenance");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Project ID',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Consultant ID',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Attachments',
      dataIndex: 'attachments',
      key: 'attachments',
      render: (attachments) => {
        if (!attachments) return '-';
        return (
          <a href={attachments} target="_blank" rel="noopener noreferrer">
            View Attachment
          </a>
        );
      }
    },
    {
      title: 'Request Status',
      dataIndex: 'requestStatus',
      key: 'requestStatus',
      render: (status) => (
        <Tag color={status === 'CONFIRMED' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Maintenance Status',
      dataIndex: 'maintenanceStatus',
      key: 'maintenanceStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Agreed Price',
      dataIndex: 'agreedPrice',
      key: 'agreedPrice',
      render: (price) => price?.toLocaleString() || '-',
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date, record) => {
        // Nếu đang edit record này
        if (editingIds.has(record.id)) {
          return (
            <DatePicker
              value={selectedDates[record.id]?.scheduledDate || date}
              onChange={(newDate) => handleDateChange(newDate, record.id, 'scheduledDate')}
              format="YYYY-MM-DD"
            />
          );
        }
        // Nếu không edit thì hiển thị date bình thường
        return date?.format('YYYY-MM-DD') || '-';
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date?.format('YYYY-MM-DD') || '-',
    },
    {
      title: 'Completion Date',
      dataIndex: 'completionDate',
      key: 'completionDate',
      render: (date) => date?.format('YYYY-MM-DD') || '-',
    },
    {
      title: 'Maintenance Notes',
      dataIndex: 'maintenanceNotes',
      key: 'maintenanceNotes',
      ellipsis: true,
    },
    {
      title: 'Maintenance Images',
      dataIndex: 'maintenanceImages',
      key: 'maintenanceImages',
      render: (images) => {
        if (!images || images.length === 0) return '-';
        return (
          <Space>
            {images.map((image, index) => (
              <a 
                key={index} 
                href={image} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Image {index + 1}
              </a>
            ))}
          </Space>
        );
      }
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo) => assignedTo || '-',
    },
    // Actions column ở cuối
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => {
        const isAssignedOrScheduled = ['ASSIGNED', 'SCHEDULED'].includes(record.maintenanceStatus);

        return (
          <Space direction="vertical">
            {/* Nút Schedule luôn hiển thị */}
            <Button 
              onClick={() => {
                setEditingIds(prev => new Set(prev).add(record.id));
                setSelectedDates(prev => ({
                  ...prev,
                  [record.id]: {
                    scheduledDate: record.scheduledDate
                  },
                }));
              }}
            >
              Schedule
            </Button>

            {/* Nút Save chỉ hiển thị khi đang edit schedule */}
            {editingIds.has(record.id) && (
              <Button onClick={() => handleSubmitDates(record.id)}>
                Save
              </Button>
            )}

            {/* Nút Start Maintenance */}
            {isAssignedOrScheduled && record.scheduledDate && (
              <Button 
                type="primary"
                onClick={() => handleStartMaintenance(record.id)}
              >
                Start Maintenance
              </Button>
            )}

            {/* Nút Complete Maintenance */}
            {record.maintenanceStatus === 'IN_PROGRESS' && (
              <Button 
                type="primary"
                onClick={() => showCompleteModal(record.id)}
              >
                Complete Maintenance
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return 'blue';
      case 'SCHEDULED':
        return 'orange';
      case 'IN_PROGRESS':
        return 'green';
      case 'COMPLETED':
        return 'purple';
      default:
        return 'default';
    }
  };

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
    const interval = setInterval(fetchMaintenanceRequests, 300000);
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
      <Modal
        title="Complete Maintenance"
        visible={isCompleteModalVisible}
        onOk={handleCompleteMaintenance}
        onCancel={() => {
          setIsCompleteModalVisible(false);
          setMaintenanceNotes('');
          setMaintenanceImages([]);
          setSelectedMaintenanceId(null);
        }}
      >
        <Form layout="vertical">
          <Form.Item 
            label="Maintenance Notes" 
            required
            rules={[{ required: true, message: 'Please enter maintenance notes' }]}
          >
            <Input.TextArea
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              rows={4}
            />
          </Form.Item>
          <Form.Item 
            label="Maintenance Images" 
            required
            rules={[{ required: true, message: 'Please upload at least one image' }]}
          >
            <Upload
              listType="picture-card"
              fileList={maintenanceImages}
              onChange={({ fileList }) => setMaintenanceImages(fileList)}
              beforeUpload={() => false}
              accept="image/*"
            >
              {maintenanceImages.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ConstrucMain;
