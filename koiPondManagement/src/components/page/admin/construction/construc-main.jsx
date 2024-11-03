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
      title: 'Tư vấn viên',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Tài liệu đính kèm',
      dataIndex: 'attachments',
      key: 'attachments',
      render: (attachments) => {
        if (!attachments || attachments.length === 0) return '-';
        return (
          <Space>
            {Array.isArray(attachments) ? (
              attachments.map((attachment, index) => (
                <a key={index} href={attachment} target="_blank" rel="noopener noreferrer">
                  <img src={attachment} alt={`Attachment ${index + 1}`} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                </a>
              ))
            ) : (
              <a href={attachments} target="_blank" rel="noopener noreferrer">
                <img src={attachments} alt="Attachment" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
              </a>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Trạng thái yêu cầu',
      dataIndex: 'requestStatus',
      key: 'requestStatus',
      render: (status) => (
        <Tag color={status === 'CONFIRMED' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ngày lên lịch',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date, record) => {
        if (editingIds.has(record.id)) {
          return (
            <DatePicker
              value={selectedDates[record.id]?.scheduledDate || date}
              onChange={(newDate) => handleDateChange(newDate, record.id, 'scheduledDate')}
              format="DD-MM-YYYY"
            />
          );
        }
        return date?.format('DD-MM-YYYY') || '-';
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date?.format('DD-MM-YYYY') || '-',
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completionDate',
      key: 'completionDate',
      render: (date) => date?.format('DD-MM-YYYY') || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => moment(date).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => {
        const renderActionButton = (status, label, onClick, isCompleted, isNext) => {
          if (isCompleted) {
            return (
              <Button type="text" style={{ color: 'green', cursor: 'default' }}>
                {label} ✓
              </Button>
            );
          }
          if (isNext) {
            return (
              <Button type="primary" onClick={onClick}>
                {label}
              </Button>
            );
          }
          return (
            <Button type="text" disabled>
              {label}
            </Button>
          );
        };

        const getMaintenanceSteps = () => {
          const steps = [];
          
          // Step 1: Lên lịch
          steps.push(
            renderActionButton(
              'ASSIGNED',
              'Lên lịch',
              () => {
                setEditingIds(prev => new Set(prev).add(record.id));
                setSelectedDates(prev => ({
                  ...prev,
                  [record.id]: { scheduledDate: record.scheduledDate },
                }));
              },
              record.maintenanceStatus !== 'ASSIGNED',
              record.maintenanceStatus === 'ASSIGNED'
            )
          );

          // Show save button if currently editing
          if (editingIds.has(record.id)) {
            steps.push(
              <Button key="save" onClick={() => handleSubmitDates(record.id)}>
                Lưu
              </Button>
            );
          }

          // Step 2: Bắt đầu bảo trì
          steps.push(
            renderActionButton(
              'SCHEDULED',
              'Bắt đầu bảo trì',
              () => handleStartMaintenance(record.id),
              ['IN_PROGRESS', 'COMPLETED'].includes(record.maintenanceStatus),
              record.maintenanceStatus === 'SCHEDULED'
            )
          );

          // Step 3: Hoàn thành bảo trì
          steps.push(
            renderActionButton(
              'IN_PROGRESS',
              'Hoàn thành bảo trì',
              () => showCompleteModal(record.id),
              record.maintenanceStatus === 'COMPLETED',
              record.maintenanceStatus === 'IN_PROGRESS'
            )
          );

          // Step 4: Show completed status
          if (record.maintenanceStatus === 'COMPLETED') {
            steps.push(
              <Tag color="success">Đã hoàn thành</Tag>
            );
          }

          return steps;
        };

        return (
          <Space direction="vertical">
            {getMaintenanceSteps()}
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
      <Title level={2}>Yêu cầu bảo trì</Title>
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
        title="Hoàn thành bảo trì"
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
            label="Ghi chú bảo trì" 
            required
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú bảo trì' }]}
          >
            <Input.TextArea
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              rows={4}
            />
          </Form.Item>
          <Form.Item 
            label="Hình ảnh bảo trì" 
            required
            rules={[{ required: true, message: 'Vui lòng tải lên ít nhất một hình ảnh' }]}
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
