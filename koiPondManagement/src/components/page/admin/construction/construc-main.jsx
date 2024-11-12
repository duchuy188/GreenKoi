import React, { useState, useEffect } from 'react';
import { Table, message, Card, Typography, Tag, Space, Spin, Button, DatePicker, Modal, Form, Input, Upload } from 'antd';
import api from "../../../config/axios";
import moment from 'moment';
import { toast } from 'react-toastify';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";

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
        consultantName: request.consultantName || '',
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
        customerName: request.customerName || '',
        customerPhone: request.customerPhone || '',
        customerEmail: request.customerEmail || '',
      }));

      setMaintenanceRequests(transformedData);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      message.error("Không thể tải danh sách yêu cầu bảo trì");
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
        toast.success("Bắt đầu bảo trì thành công");
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error starting maintenance:', error);
      message.error("Không thể bắt đầu bảo trì");
    }
  };

  const handleSubmitDates = async (id) => {
    const dates = selectedDates[id] || {};
    
    if (!dates.scheduledDate) {
      message.error("Vui lòng chọn ngày lên lịch");
      return;
    }

    try {
      const response = await api.patch(`/api/maintenance-requests/${id}/schedule`, {
        scheduledDate: dates.scheduledDate.format('YYYY-MM-DD'),
        maintenanceStatus: 'SCHEDULED'
      });

      if (response.status === 200) {
        toast.success("Cập nhật lịch thành công");
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
      message.error("Không thể cập nhật lịch");
    }
  };

  const showCompleteModal = (id) => {
    setSelectedMaintenanceId(id);
    setIsCompleteModalVisible(true);
  };

  const handleCompleteMaintenance = async () => {
    try {
      if (!maintenanceNotes.trim()) {
        toast.error("Vui lòng nhập ghi chú bảo trì");
        return;
      }

      if (maintenanceImages.length === 0) {
        toast.error("Vui lòng tải lên ít nhất một hình ảnh");
        return;
      }

      // Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        maintenanceImages.map(async (file) => {
          if (file.originFileObj) {
            const storageRef = ref(storage, `maintenance-images/${Date.now()}-${file.originFileObj.name}`);
            const uploadTask = await uploadBytesResumable(storageRef, file.originFileObj);
            return await getDownloadURL(uploadTask.ref);
          }
          return file.url;
        })
      );

      const requestBody = {
        maintenanceNotes: maintenanceNotes,
        maintenanceImages: imageUrls,
      };

      const response = await api.patch(
        `/api/maintenance-requests/${selectedMaintenanceId}/complete-maintenance`,
        requestBody
      );

      if (response.status === 200) {
        toast.success("Hoàn thành bảo trì thành công");
        setIsCompleteModalVisible(false);
        setMaintenanceNotes('');
        setMaintenanceImages([]);
        setSelectedMaintenanceId(null);
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error completing maintenance:', error);
      message.error(error.response?.data?.message || "Không thể hoàn thành bảo trì");
    }
  };

  const getRequestStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'REJECTED':
        return 'Đã từ chối';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const showDescriptionModal = (description) => {
    Modal.info({
      title: 'Chi tiết mô tả',
      content: <p>{description}</p>,
      width: 300,
      okText: 'Đồng ý',
    });
  };

  const columns = [
    {
      title: 'Thông tin khách hàng',
      key: 'customerInfo',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical">
          <div><strong>{record.customerName}</strong></div>
          <Button type="link" onClick={() => Modal.info({
            title: 'Thông tin chi tiết',
            content: (
              <div>
                <p><strong>Số điện thoại:</strong> {record.customerPhone}</p>
                <p><strong>Email:</strong> {record.customerEmail}</p>
                <p><strong>Tư vấn viên:</strong> {record.consultantName}</p>
                <p><strong>Ngày tạo:</strong> {moment(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</p>
                <p><strong>Ngày cập nhật:</strong> {moment(record.updatedAt).format('DD-MM-YYYY HH:mm:ss')}</p>
              </div>
            ),
            width: 500,
            okText: 'Đồng ý',
          })}>
            Xem thông tin
          </Button>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
      render: (description) => (
        <Space>
          <Button type="link"  style={{ color: 'black' }} onClick={() => showDescriptionModal(description)}>
            
            <EyeOutlined />
          </Button>
        </Space>
      ),
      
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
          {getRequestStatusText(status)}
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
      <Title level={2}>Nhiệm vụ bảo trì</Title>
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
            showTotal: (total) => `Tổng cộng ${total} mục`
          }}
        />
      )}
      <Modal
        title="Hoàn thành bảo trì"
        open={isCompleteModalVisible}
        onOk={handleCompleteMaintenance}
        onCancel={() => {
          setIsCompleteModalVisible(false);
          setMaintenanceNotes('');
          setMaintenanceImages([]);
          setSelectedMaintenanceId(null);
        }}
        okText="Đồng ý"
        cancelText="Hủy"
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
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
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
