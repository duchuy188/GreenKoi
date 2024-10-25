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
        message.error('Cấu trúc dữ liệu không mong đợi');
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error('Không thể tải danh sách đơn hàng');
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
      message.success('Đánh giá đã được gửi thành công');
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
      message.error(`Không thể gửi đánh giá: ${error.message}`);
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
      message.success('Yêu cầu bảo trì đã được gửi thành công');
      setIsMaintenanceModalVisible(false);
      maintenanceForm.resetFields();
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      message.error(`Không thể gửi yêu cầu bảo trì: ${error.message}`);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  return (
    <div>
      <h1>Đơn Hàng Của Tôi</h1>
      <Row gutter={[16, 16]}>
        {orders.map(order => (
          <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
            <Card
              title={order.name}
              extra={
                <div>
                  <Button onClick={() => handleViewDetails(order)}>Xem Chi Tiết</Button>
                  {order.statusName === 'COMPLETED' && (
                    <>
                      <Button onClick={() => handleReview(order)} style={{ marginLeft: '8px' }}>Đánh Giá</Button>
                      <Button onClick={() => handleRequestMaintenance(order)} style={{ marginLeft: '8px' }}>Yêu Cầu Bảo Trì</Button>
                    </>
                  )}
                </div>
              }
              loading={loading}
            >
              <p><strong>Mã Đơn:</strong> {order.id}</p>
              <p><strong>Tổng Giá:</strong> {order.totalPrice != null ? `$${Number(order.totalPrice).toFixed(2)}` : 'N/A'}</p>
              <p><strong>Trạng Thái:</strong> {order.statusName}</p>
              <p><strong>Ngày Bắt Đầu:</strong> {moment(order.startDate).format('DD/MM/YYYY')}</p>
              <p><strong>Ngày Kết Thúc:</strong> {moment(order.endDate).format('DD/MM/YYYY')}</p>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        title="Chi Tiết Đơn Hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <p><strong>Tên:</strong> {selectedOrder.name || 'N/A'}</p>
            <p><strong>Mô Tả:</strong> {selectedOrder.description || 'N/A'}</p>
            <p><strong>Tổng Giá:</strong> {selectedOrder.totalPrice != null ? `$${Number(selectedOrder.totalPrice).toFixed(2)}` : 'N/A'}</p>
            <p><strong>Số Tiền Đặt Cọc:</strong> {selectedOrder.depositAmount != null ? `$${Number(selectedOrder.depositAmount).toFixed(2)}` : 'N/A'}</p>
            <p><strong>Trạng Thái:</strong> {selectedOrder.statusName || 'N/A'}</p>
            <p><strong>Ngày Bắt Đầu:</strong> {selectedOrder.startDate ? moment(selectedOrder.startDate).format('DD/MM/YYYY') : 'N/A'}</p>
            <p><strong>Ngày Kết Thúc:</strong> {selectedOrder.endDate ? moment(selectedOrder.endDate).format('DD/MM/YYYY') : 'N/A'}</p>
            <p><strong>Mã Tư Vấn Viên:</strong> {selectedOrder.consultantId || 'N/A'}</p>
            <h3>Công Việc:</h3>
            <ul>
              {(selectedOrder.tasks || []).map((task, index) => (
                <li key={index}>
                  {task.name} - Trạng Thái: {task.status}, Hoàn Thành: {task.completionPercentage != null ? `${task.completionPercentage}%` : 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
      <Modal
        title="Gửi Đánh Giá"
        visible={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={submitReview}>
          <Form.Item name="rating" label="Đánh Giá" rules={[{ required: true, message: 'Vui lòng đánh giá dự án' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Bình Luận" rules={[{ required: true, message: 'Vui lòng để lại bình luận' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Gửi Đánh Giá
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Yêu Cầu Bảo Trì"
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
            label="Mô Tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="attachments" label="Tệp Đính Kèm">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={maintenanceLoading}>
              Gửi Yêu Cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersCustomer;
