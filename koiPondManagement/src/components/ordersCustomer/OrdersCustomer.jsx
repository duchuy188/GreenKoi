import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, message, Rate, Input, Form, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '/src/components/config/axios';
import moment from 'moment';

const OrdersCustomer = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isMaintenanceModalVisible, setIsMaintenanceModalVisible] = useState(false);
  const [maintenanceForm] = Form.useForm();
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/projects/customer`);
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.error("Unexpected data structure:", response.data);
        message.error('Unexpected data structure received');
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleReview = (order) => {
    setSelectedOrder(order);
    setIsReviewModalVisible(true);
  };

  const submitReview = async (values) => {
    try {
      const reviewData = {
        maintenanceRequestId: selectedOrder.id, 
        projectId: selectedOrder.id,
        rating: values.rating,
        comment: values.comment,
        reviewDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        status: "SUBMITTED"
      };

      const response = await api.post(`/api/projects/${selectedOrder.id}/reviews`, reviewData);
      console.log('Review submission response:', response);
      message.success('Review submitted successfully');
      setIsReviewModalVisible(false);
      form.resetFields();
      fetchOrders();
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      message.error(`Failed to submit review: ${error.message}`);
    }
  };

  const handleRequestMaintenance = (order) => {
    setSelectedOrder(order);
    maintenanceForm.setFieldsValue({
      projectId: order.id,
    });
    setIsMaintenanceModalVisible(true);
  };

  const submitMaintenanceRequest = async (values) => {
    try {
      setMaintenanceLoading(true);
      const maintenanceData = {
        projectId: values.projectId,
        description: values.description,
        attachments: values.attachments
      };

      const response = await api.post(`/api/maintenance-requests`, maintenanceData);
      console.log('Maintenance request submission response:', response);
      message.success('Maintenance request submitted successfully');
      setIsMaintenanceModalVisible(false);
      maintenanceForm.resetFields();
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      message.error(`Failed to submit maintenance request: ${error.message}`);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  return (
    <div>
      <h1>My Orders</h1>
      <Row gutter={[16, 16]}>
        {orders.map(order => (
          <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
            <Card
              title={order.name}
              extra={
                <div>
                  <Button onClick={() => handleViewDetails(order)}>View Details</Button>
                  {order.statusName === 'COMPLETED' && (
                    <>
                      <Button onClick={() => handleReview(order)} style={{ marginLeft: '8px' }}>Review</Button>
                      <Button onClick={() => handleRequestMaintenance(order)} style={{ marginLeft: '8px' }}>Yêu Cầu bảo trì</Button>
                    </>
                  )}
                </div>
              }
              loading={loading}
            >
              <p><strong>ID:</strong> {order.id}</p>
              <p><strong>Total Price:</strong> {order.totalPrice != null ? `$${Number(order.totalPrice).toFixed(2)}` : 'N/A'}</p>
              <p><strong>Status:</strong> {order.statusName}</p>
              <p><strong>Start Date:</strong> {moment(order.startDate).format('YYYY-MM-DD')}</p>
              <p><strong>End Date:</strong> {moment(order.endDate).format('YYYY-MM-DD')}</p>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        title="Order Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <p><strong>Name:</strong> {selectedOrder.name || 'N/A'}</p>
            <p><strong>Description:</strong> {selectedOrder.description || 'N/A'}</p>
            <p><strong>Total Price:</strong> {selectedOrder.totalPrice != null ? `$${Number(selectedOrder.totalPrice).toFixed(2)}` : 'N/A'}</p>
            <p><strong>Deposit Amount:</strong> {selectedOrder.depositAmount != null ? `$${Number(selectedOrder.depositAmount).toFixed(2)}` : 'N/A'}</p>
            <p><strong>Status:</strong> {selectedOrder.statusName || 'N/A'}</p>
            <p><strong>Start Date:</strong> {selectedOrder.startDate ? moment(selectedOrder.startDate).format('YYYY-MM-DD') : 'N/A'}</p>
            <p><strong>End Date:</strong> {selectedOrder.endDate ? moment(selectedOrder.endDate).format('YYYY-MM-DD') : 'N/A'}</p>
            <p><strong>Consultant ID:</strong> {selectedOrder.consultantId || 'N/A'}</p>
            <h3>Tasks:</h3>
            <ul>
              {(selectedOrder.tasks || []).map((task, index) => (
                <li key={index}>
                  {task.name} - Status: {task.status}, Completion: {task.completionPercentage != null ? `${task.completionPercentage}%` : 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
      <Modal
        title="Submit Review"
        visible={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={submitReview}>
          <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Please rate the project' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Comment" rules={[{ required: true, message: 'Please leave a comment' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit Review
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Maintenance Request"
        visible={isMaintenanceModalVisible}
        onCancel={() => {
          setIsMaintenanceModalVisible(false);
          maintenanceForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={maintenanceForm}
          onFinish={submitMaintenanceRequest}
          layout="vertical"
        >
          <Form.Item name="projectId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="attachments" label="Attachments">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={maintenanceLoading}>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersCustomer;
