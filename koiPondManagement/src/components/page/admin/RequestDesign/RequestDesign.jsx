import React, { useState, useEffect } from 'react';
import axios from '../../../config/axios';
import { Table, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function RequestDesign() {
  const [designRequests, setDesignRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tên thiết kế',
      dataIndex: 'designName',
      key: 'designName',
    },
    {
      title: 'Kích thước',
      dataIndex: 'dimensions',
      key: 'dimensions',
    },
    {
      title: 'Ngân sách',
      dataIndex: 'budget',
      key: 'budget',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'designNotes',
      key: 'designNotes',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdat',
      key: 'createdat',
      render: (text) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary"
          onClick={() => navigate(`/dashboard/requestdesign/${record.id}`)}
        >
          Tạo thiết kế
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const fetchDesignRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Token being used:', token);

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        console.log('Request config:', config);

        const response = await axios.get('/api/design-requests/designer', config);
        setDesignRequests(response.data);
      } catch (error) {
        console.error('Error details:', error.response);
        console.error('Error fetching design requests:', error);
      }
      setLoading(false);
    };

    fetchDesignRequests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Yêu cầu thiết kế</h1>
      <Table
        columns={columns}
        dataSource={designRequests}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
      />
    </div>
  );
}

export default RequestDesign;
