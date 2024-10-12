import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message } from 'antd';
import api from "../../../config/axios";
import { toast } from "react-toastify";

const Consulting = () => {
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultationRequests();
  }, []);

  const fetchConsultationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ConsultationRequests');
      if (Array.isArray(response.data)) {
        setConsultationRequests(response.data);
      } else if (response.data.consultationRequests) {
        setConsultationRequests(response.data.consultationRequests);
      } else {
        setConsultationRequests([]);
        toast.error("Failed to load consultation requests. Unexpected data structure.");
      }
    } catch (error) {
      console.error('Error fetching consultation requests:', error);
      toast.error(error.response ? `Error: ${error.response.status} - ${error.response.data.message}` : "Network error. Please check your connection.");
      setConsultationRequests([]);
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
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Customer Phone',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: 'Customer Address',
      dataIndex: 'customerAddress',
      key: 'customerAddress',
    },
    {
      title: 'Design Name',
      dataIndex: 'designName',
      key: 'designName',
    },
    {
      title: 'Design Description',
      dataIndex: 'designDescription',
      key: 'designDescription',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleViewDetails(record)}>View Details</Button>
          <Button onClick={() => handleUpdateStatus(record)}>Update Status</Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    // Implement view details functionality
    console.log('View details for:', record);
    // You can open a modal or navigate to a details page here
  };

  const handleUpdateStatus = async (record) => {
    // Implement update status functionality
    console.log('Update status for:', record);
    // You can open a modal to update the status or implement inline editing
    // After updating, you should refetch the data
    // Example:
    // try {
    //   await api.put(`/api/ConsultationRequests/${record.id}`, { status: 'new_status' });
    //   toast.success("Status updated successfully");
    //   fetchConsultationRequests();
    // } catch (error) {
    //   toast.error("Failed to update status");
    // }
  };

  return (
    <div>
      <h1>Consultation Requests</h1>
      <Table
        columns={columns}
        dataSource={consultationRequests}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default Consulting;

