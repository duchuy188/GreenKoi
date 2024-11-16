import React, { useState, useEffect } from 'react';
import { Table, message, Space, Tag, Typography } from 'antd';
import axios from '../../../config/axios';
import moment from 'moment';
import AssignDesignerAction from './AssignDesignerAction';

const { Text } = Typography;

const ManageCustomerRequest = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const fetchDesignRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/design-requests/pending-assignment');
      console.log('API Response:', response.data);
      const designRequests = Array.isArray(response.data) ? response.data : [];
      console.log('Processed requests:', designRequests);
      setRequests(designRequests);
    } catch (error) {
      console.error('Error details:', error);
      message.error('Không thể tải danh sách yêu cầu thiết kế');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignRequests();
  }, []);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Yêu cầu',
      dataIndex: 'requirements',
      key: 'requirements',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Phong cách',
      dataIndex: 'preferredStyle',
      key: 'preferredStyle',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Ngân sách',
      dataIndex: 'budget',
      key: 'budget',
      width: 150,
      render: (budget) => {
        if (!budget) return 'Chưa có';
        return `${Number(budget).toLocaleString()} VND`;
      },
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING': 'Chờ xử lý',
          'IN_PROGRESS': 'Đang xử lý',
          // ... other statuses
        };
        return <Tag color={status === 'IN_PROGRESS' ? 'processing' : 'warning'}>
          {statusMap[status] || status}
        </Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <AssignDesignerAction 
          requestId={record.id} 
          onAssignSuccess={fetchDesignRequests}
        />
      ),
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>Quản lý yêu cầu thiết kế</h2>
      <Table 
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} yêu cầu`,
        }}
      />
    </div>
  );
};

export default ManageCustomerRequest;
