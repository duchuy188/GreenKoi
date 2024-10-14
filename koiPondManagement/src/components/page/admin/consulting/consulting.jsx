import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Modal, Form, Input, Select } from 'antd';
import { FaEdit } from 'react-icons/fa'; // Import biểu tượng chỉnh sửa
import api from "../../../config/axios";
import { toast } from "react-toastify";

const Consulting = () => {
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();

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

  const handleViewDetails = (record) => {
    setSelectedNotes(record.notes || 'No notes available');
    setDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedNotes('');
  };

  const handleEditRequest = (record) => {
    setSelectedRequest(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };

  const handleUpdateRequest = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await api.put(`/api/ConsultationRequests/${selectedRequest.id}/status?newStatus=${values.status}`, {}, config);
      message.success("Request status updated successfully");
      setEditModalVisible(false);
      await fetchConsultationRequests(); // Refresh the data
    } catch (error) {
      console.error('Error updating request:', error);
      message.error("Failed to update request status: " + (error.response?.data?.message || error.message));
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
          <FaEdit 
            onClick={() => handleEditRequest(record)} 
            style={{ cursor: 'pointer', fontSize: '18px' }} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Consultation Requests</h1>
      <Table
        columns={columns}
        dataSource={consultationRequests}
        loading={loading}
        rowKey="id"
      />
      <Modal
        title="Customer Notes"
        visible={detailsVisible}
        onCancel={handleCloseDetails}
        footer={[
          <Button key="close" onClick={handleCloseDetails}>
            Close
          </Button>
        ]}
      >
        <p>{selectedNotes}</p>
      </Modal>
      <Modal
        title="Edit Consultation Request"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateRequest}
          layout="vertical"
          initialValues={selectedRequest}
        >
          <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item name="customerPhone" label="Customer Phone" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item name="customerAddress" label="Customer Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="designName" label="Design Name" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item name="designDescription" label="Design Description" rules={[{ required: true }]}>
            <Input.TextArea readOnly />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Consulting;
