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
      title: 'Lý do từ chối',
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      render: (text, record) => (
        record.status === 'IN_PROGRESS' && text ? text : '-'
      ),
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
      setDesignRequests(response.data);
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
