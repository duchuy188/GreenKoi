import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  message,
  Rate,
  Input,
  Form,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "/src/components/config/axios";
import moment from "moment";
import "./OrdersCustomer.css";

const OrdersCustomer = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isMaintenanceModalVisible, setIsMaintenanceModalVisible] =
    useState(false);
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
        message.error("Cấu trúc dữ liệu không mong đợi");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Không thể tải danh sách đơn hàng");
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
        status: "SUBMITTED",
      };

      const response = await api.post(
        `/api/projects/${selectedOrder.id}/reviews`,
        reviewData
      );
      console.log("Review submission response:", response);
      message.success("Đánh giá đã được gửi thành công");
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
        attachments: values.attachments,
      };

      const response = await api.post(
        `/api/maintenance-requests`,
        maintenanceData
      );
      console.log("Maintenance request submission response:", response);
      message.success("Yêu cầu bảo trì đã được gửi thành công");
      setIsMaintenanceModalVisible(false);
      maintenanceForm.resetFields();
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      message.error(`Không thể gửi yêu cầu bảo trì: Đơn hàng chưa hoàn thành`);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleVNPayPayment = async (projectId) => {
    try {
      const response = await api.post(
        `/api/payments/create-payment/${projectId}`
      );
      if (response.data && response.data.paymentUrl) {
        window.open(response.data.paymentUrl, "_blank");
      } else {
        message.error("Không thể tạo liên kết thanh toán");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      message.error("Không thể khởi tạo thanh toán VNPAY");
    }
  };

  return (
    <div className="orders-container">
      <div className="d-flex justify-content-center align-items-center mb-4">
        <h1 className="text-center fw-bold text-dark">
          <i className="fas fa-shopping-cart me-2"></i>Dự Án Của Tôi
        </h1>
      </div>

      <div className="container container-width">
        <div className="row g-4 mx-0">
          {orders.map((order) => (
            <div className="col-12" key={order.id}>
              <div className="card shadow-sm border-0 rounded-3 mx-2">
                <div className="card-header bg-warning text-dark py-2">
                  <h6 className="card-title mb-0 fw-bold badge-project">
                    <i className="fas fa-project-diagram me-2"></i>
                    {order.name || `Project for ${order.customerName}`}
                  </h6>
                </div>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">
                      <i className="fas fa-hashtag me-1"></i>Mã Đơn: {order.id}
                    </small>
                    <span className="badge bg-danger text-white">
                      <i className="fas fa-info-circle me-1"></i>
                      {order.statusName}
                    </span>
                  </div>
                  <p className="card-text mb-1">
                    <i className="fas fa-dollar-sign me-2 text-warning"></i>
                    <strong>Tổng Giá:</strong>{" "}
                    {(order.totalPrice || 0).toLocaleString("vi-VN")}đ
                  </p>
                  <p className="card-text mb-1">
                    <i className="fas fa-calendar-alt me-2 text-warning"></i>
                    <small className="text-muted">
                      Bắt Đầu: {moment(order.startDate).format("DD/MM/YYYY")}
                    </small>
                  </p>
                  <p className="card-text mb-1">
                    <i className="fas fa-calendar-check me-2 text-warning"></i>
                    <small className="text-muted">
                      Kết Thúc: {moment(order.endDate).format("DD/MM/YYYY")}
                    </small>
                  </p>
                </div>
                <div className="card-footer bg-transparent border-top-0 pt-0">
                  <button
                    className="btn btn-warning btn-sm w-100 text-dark mb-2"
                    onClick={() => handleViewDetails(order)}
                  >
                    <i className="fas fa-eye me-2"></i>Xem Chi Tiết
                  </button>
                  <button
                    className="btn btn-primary btn-sm w-100 text-dark mb-2"
                    onClick={() => handleVNPayPayment(order.id)}
                  >
                    <i className="fas fa-credit-card me-2"></i>Thanh Toán VNPAY
                  </button>
                  <button
                    className="btn btn-info btn-sm w-100 text-dark mb-2"
                    onClick={() => handleRequestMaintenance(order)}
                  >
                    <i className="fas fa-tools me-2"></i>Yêu Cầu Bảo Trì
                  </button>
                  <button
                    className="btn btn-success btn-sm w-100 text-dark"
                    onClick={() => handleReview(order)}
                  >
                    <i className="fas fa-star me-2"></i>Đánh Giá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title={
          <h4 className="text-warning mb-0">
            <i className="fas fa-info-circle me-2"></i>Chi Tiết Đơn Hàng
          </h4>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        {selectedOrder && (
          <div className="p-3">
            <div className="row">
              <div className="col-md-6">
                <p>
                  <i className="fas fa-tag text-warning me-2"></i>
                  <strong>Tên:</strong> {selectedOrder.name || "N/A"}
                </p>
                <p>
                  <i className="fas fa-align-left text-orange me-2"></i>
                  <strong>Mô Tả:</strong> {selectedOrder.description || "N/A"}
                </p>
                <p>
                  <i className="fas fa-dollar-sign text-warning me-2"></i>
                  <strong>Tổng Giá:</strong>{" "}
                  {selectedOrder.totalPrice != null
                    ? `$${Number(selectedOrder.totalPrice).toFixed(2)}`
                    : "N/A"}
                </p>
                <p>
                  <i className="fas fa-piggy-bank text-orange me-2"></i>
                  <strong>Số Tiền Đặt Cọc:</strong>{" "}
                  {selectedOrder.depositAmount != null
                    ? `$${Number(selectedOrder.depositAmount).toFixed(2)}`
                    : "N/A"}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <i className="fas fa-chart-line text-warning me-2"></i>
                  <strong>Trạng Thái:</strong>{" "}
                  <span className="badge bg-warning text-dark">
                    {selectedOrder.statusName || "N/A"}
                  </span>
                </p>
                <p>
                  <i className="fas fa-calendar-alt text-orange me-2"></i>
                  <strong>Ngày Bắt Đầu:</strong>{" "}
                  {selectedOrder.startDate
                    ? moment(selectedOrder.startDate).format("DD/MM/YYYY")
                    : "N/A"}
                </p>
                <p>
                  <i className="fas fa-calendar-check text-warning me-2"></i>
                  <strong>Ngày Kết Thúc:</strong>{" "}
                  {selectedOrder.endDate
                    ? moment(selectedOrder.endDate).format("DD/MM/YYYY")
                    : "N/A"}
                </p>
                <p>
                  <i className="fas fa-user-tie text-orange me-2"></i>
                  <strong>Mã Tư Vấn Viên:</strong>{" "}
                  {selectedOrder.consultantId || "N/A"}
                </p>
              </div>
            </div>
            <h5 className="mt-4 mb-3 text-warning">
              <i className="fas fa-tasks me-2"></i>Công Việc:
            </h5>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-warning">
                  <tr>
                    <th>
                      <i className="fas fa-clipboard-list text-warning me-2"></i>
                      Tên Công Việc
                    </th>
                    <th>
                      <i className="fas fa-info-circle text-orange me-2"></i>
                      Trạng Thái
                    </th>
                    <th>
                      <i className="fas fa-percentage text-warning me-2"></i>
                      Hoàn Thành
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.tasks || []).map((task, index) => (
                    <tr key={index}>
                      <td>{task.name}</td>
                      <td>{task.status}</td>
                      <td>
                        {task.completionPercentage != null
                          ? `${task.completionPercentage}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <h4 className="text-warning mb-0">
            <i className="fas fa-star me-2"></i>Gửi Đánh Giá
          </h4>
        }
        visible={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} onFinish={submitReview} layout="vertical">
          <Form.Item
            name="rating"
            label={
              <span>
                <i className="fas fa-star text-warning me-2"></i>Đánh Giá
              </span>
            }
            rules={[{ required: true, message: "Vui lòng đánh giá dự án" }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label={
              <span>
                <i className="fas fa-comment text-orange me-2"></i>Bình Luận
              </span>
            }
            rules={[{ required: true, message: "Vui lòng để lại bình luận" }]}
          >
            <Input.TextArea rows={4} className="form-control" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="btn btn-warning text-dark w-100"
            >
              <i className="fas fa-paper-plane me-2"></i>Gửi Đánh Giá
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
            <Button
              type="primary"
              htmlType="submit"
              loading={maintenanceLoading}
            >
              Gửi Yêu Cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersCustomer;
