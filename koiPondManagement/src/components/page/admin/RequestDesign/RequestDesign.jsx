import React, { useState, useEffect } from 'react';
import axios from '../../../config/axios';
import { Table, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import EditDesignModal from './EditDesignModal';
import { toast } from 'react-toastify';

function RequestDesign() {
  const [designRequests, setDesignRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentDesign, setCurrentDesign] = useState(null);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'KHÁCH HÀNG',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'YÊU CẦU',
      dataIndex: 'requirements',
      key: 'requirements',
    },
    {
      title: 'PHONG CÁCH',
      dataIndex: 'preferredStyle',
      key: 'preferredStyle',
    },
    {
      title: 'NGÂN SÁCH',
      dataIndex: 'budget',
      key: 'budget',
      render: (text) => `${text} VND`,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let statusText = 'Chờ xử lý';
        let statusClass = 'bg-yellow-100 text-yellow-800';

        switch (status) {
          case 'PENDING':
            statusText = 'Chờ xử lý';
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'IN_PROGRESS':
            statusText = 'Đang thực hiện';
            statusClass = 'bg-blue-100 text-blue-800';
            break;
          case 'COMPLETED':
            statusText = 'Hoàn thành';
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 'CANCELLED':
            statusText = 'Đã hủy';
            statusClass = 'bg-red-100 text-red-800';
            break;
          default:
            break;
        }

        return (
          <span className={`px-3 py-1 rounded-full ${statusClass}`}>
            {statusText}
          </span>
        );
      },
    },
    {
      title: 'LÝ DO TỪ CHỐI',
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      render: (text, record) => (
        record.status === 'IN_PROGRESS' && text ? text : '-'
      ),
    },
    {
      title: 'NGÀY TẠO',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      render: (_, record) => {
        console.log('Record data:', record);
        return (
          record.status === 'IN_PROGRESS' && (
            <Button 
              type="primary"
              onClick={() => {
                console.log('Clicking with designId:', record.designId, 'requestId:', record.id);
                record.rejectionReason ? 
                  handleEditClick(record.designId, record.id) : 
                  navigate(`/dashboard/requestdesign/${record.id}`);
              }}
            >
              {record.rejectionReason ? 'Chỉnh sửa thiết kế' : 'Tạo thiết kế'}
            </Button>
          )
        );
      },
    },
  ];

  const fetchDesignRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.get('/api/design-requests/designer', config);
      const sortedRequests = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setDesignRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching design requests:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesignRequests();
  }, []);

  const handleEditClick = async (designId, requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/pond-designs/${designId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Design data:', response.data);
      
      setCurrentDesign({
        ...response.data,
        requestId: requestId
      });
      setIsEditModalVisible(true);
    } catch (error) {
      console.error('Error fetching design:', error);
      toast.error('Không thể tải dữ liệu thiết kế');
    }
  };

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

      <EditDesignModal
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        designData={currentDesign}
        onSuccess={() => {
          setIsEditModalVisible(false);
          fetchDesignRequests();
        }}
      />
    </div>
  );
}

export default RequestDesign;
