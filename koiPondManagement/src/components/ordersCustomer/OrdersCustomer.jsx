import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, message } from 'antd';
import api from '/src/components/config/axios';
import moment from 'moment';

const OrdersCustomer = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  return (
    <div>
      <h1>My Orders</h1>
      <Row gutter={[16, 16]}>
        {orders.map(order => (
          <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
            <Card
              title={order.name}
              extra={<Button onClick={() => handleViewDetails(order)}>View Details</Button>}
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
    </div>
  );
};

export default OrdersCustomer;
