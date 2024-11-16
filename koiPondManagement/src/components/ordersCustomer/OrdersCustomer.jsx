import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Rate,
  Input,
  Form,
  DatePicker,
  Upload,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "/src/components/config/axios";
import moment from "moment";
import "./OrdersCustomer.css";
import axios from "axios";
import { toast } from "react-toastify";
import { storage } from "/src/components/config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Add payment status options
  const paymentStatusOptions = [
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "DEPOSIT_PAID", label: "Đã cọc" },
    { value: "FULLY_PAID", label: "Đã thanh toán" },
  ];

  useEffect(() => {
    // Initial fetch
    initialFetch();

    // Setup polling
    const pollingInterval = setInterval(() => {
      pollOrders();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollingInterval);
  }, []);

  const initialFetch = async () => {
    try {
      setInitialLoading(true);
      await fetchOrders(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const pollOrders = async () => {
    try {
      setIsPolling(true);
      await fetchOrders(false);
    } finally {
      setIsPolling(false);
    }
  };

  const fetchOrders = async (isInitialFetch) => {
    try {
      const response = await api.get(`/api/projects/customer`);
      if (Array.isArray(response.data)) {
        const sortedOrders = response.data.sort((a, b) => {
          // Sort by startDate first
          const startDateDiff =
            moment(b.startDate).valueOf() - moment(a.startDate).valueOf();
          if (startDateDiff !== 0) return startDateDiff;

          // If startDate is same, sort by createdAt
          return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
        });

        setOrders((prevOrders) => {
          // Compare new orders with previous orders
          if (JSON.stringify(prevOrders) !== JSON.stringify(sortedOrders)) {
            // Only show notifications if this is not the initial fetch
            if (!isInitialFetch) {
              // Check for new orders
              sortedOrders.forEach((newOrder) => {
                const prevOrder = prevOrders.find(
                  (po) => po.id === newOrder.id
                );

                // If this is a new order
                if (!prevOrder) {
                  toast.info(`Có đơn hàng mới: "${newOrder.name}"`);
                }
                // Check for status changes
                else if (prevOrder.statusName !== newOrder.statusName) {
                  toast.info(
                    `Dự án "${
                      newOrder.name
                    }" đã được cập nhật trạng thái thành ${
                      newOrder.statusName === "IN_PROGRESS"
                        ? "ĐANG THỰC HIỆN"
                        : newOrder.statusName === "APPROVED"
                        ? "ĐÃ DUYỆT"
                        : newOrder.statusName === "PENDING"
                        ? "CHỜ DUYỆT"
                        : newOrder.statusName === "PLANNING"
                        ? "ĐANG LÊN KẾ HOẠCH"
                        : newOrder.statusName === "ON_HOLD"
                        ? "TẠM DỪNG"
                        : newOrder.statusName === "CANCELLED"
                        ? "ĐÃ HỦY"
                        : newOrder.statusName === "MAINTENANCE"
                        ? "BẢO TRÌ"
                        : newOrder.statusName === "TECHNICALLY_COMPLETED"
                        ? "ĐÃ HOÀN THÀNH KỸ THUẬT"
                        : newOrder.statusName === "COMPLETED"
                        ? "HOÀN THÀNH"
                        : newOrder.statusName
                    }`
                  );
                }

                // Check for payment status changes
                if (
                  prevOrder &&
                  prevOrder.paymentStatus !== newOrder.paymentStatus
                ) {
                  const newPaymentStatus =
                    paymentStatusOptions.find(
                      (opt) => opt.value === newOrder.paymentStatus
                    )?.label || "Chưa thanh toán";
                  toast.info(
                    `Trạng thái thanh toán của dự án "${newOrder.name}" đã được cập nhật thành ${newPaymentStatus}`
                  );
                }
              });
            }
            return sortedOrders;
          }
          return prevOrders;
        });
      } else {
        console.error("Unexpected data structure:", response.data);
        toast.error("Cấu trúc dữ liệu không mong đợi");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!isInitialFetch) {
        // Only show error toast if it's not the initial fetch
        toast.error("Không thể tải danh sách đơn hàng");
      }
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
      toast.success("Đánh giá đã được gửi thành công", {
        toastId: "review-success",
      });
      setIsReviewModalVisible(false);
      form.resetFields();
      fetchOrders();
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response?.status === 400) {
        toast.error("Không thể gửi đánh giá: Vui lòng kiểm tra lại thông tin", {
          toastId: "review-error-400",
        });
      } else if (
        error.response?.data?.message ===
        "A review already exists for this project"
      ) {
        toast.error("Dự án này đã được đánh giá trước đó", {
          toastId: "review-error-exists",
        });
      } else {
        toast.error("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau", {
          toastId: "review-error-general",
        });
      }
    }
  };

  const handleRequestMaintenance = (order) => {
    setSelectedOrder(order);
    maintenanceForm.setFieldsValue({
      projectId: order.id,
    });
    setIsMaintenanceModalVisible(true);
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `maintenance-attachments/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Không thể tải lên tệp đính kèm");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const submitMaintenanceRequest = async (values) => {
    try {
      setMaintenanceLoading(true);
      let attachmentUrls = [];

      // Handle file uploads if files are selected
      if (values.attachments?.fileList) {
        const uploadPromises = values.attachments.fileList.map(file => 
          handleFileUpload(file.originFileObj)
        );
        attachmentUrls = await Promise.all(uploadPromises);
      }

      const maintenanceData = {
        projectId: values.projectId,
        description: values.description,
        attachments: attachmentUrls.join(','), // Join URLs with comma
      };

      const response = await api.post(`/api/maintenance-requests`, maintenanceData);
      toast.success("Yêu cầu bảo trì đã được gửi thành công");
      setIsMaintenanceModalVisible(false);
      maintenanceForm.resetFields();
      fetchOrders();
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      toast.error("Không thể gửi yêu cầu bảo trì: Đơn hàng chưa hoàn thành");
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
        toast.error("Không thể tạo liên kết thanh toán", {
          toastId: "payment-error",
        });
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Không thể khởi tạo thanh toán VNPAY", {
        toastId: "vnpay-error",
      });
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
                    <span
                      className={`badge ${
                        order.statusName === "IN_PROGRESS"
                          ? "bg-primary"
                          : order.statusName === "APPROVED"
                          ? "bg-success"
                          : order.statusName === "PENDING"
                          ? "bg-warning text-dark"
                          : order.statusName === "PLANNING"
                          ? "bg-info"
                          : order.statusName === "ON_HOLD"
                          ? "bg-secondary"
                          : order.statusName === "CANCELLED"
                          ? "bg-danger"
                          : order.statusName === "MAINTENANCE"
                          ? "bg-info"
                          : order.statusName === "TECHNICALLY_COMPLETED"
                          ? "bg-info"
                          : order.statusName === "COMPLETED"
                          ? "bg-success"
                          : "bg-secondary"
                      } text-white`}
                    >
                      <i className="fas fa-info-circle me-1"></i>
                      {order.statusName === "IN_PROGRESS"
                        ? "ĐANG THỰC HIỆN"
                        : order.statusName === "APPROVED"
                        ? "ĐÃ DUYỆT"
                        : order.statusName === "PENDING"
                        ? "CHỜ DUYỆT"
                        : order.statusName === "PLANNING"
                        ? "ĐANG LÊN KẾ HOẠCH"
                        : order.statusName === "ON_HOLD"
                        ? "TẠM DỪNG"
                        : order.statusName === "CANCELLED"
                        ? "ĐÃ HỦY"
                        : order.statusName === "MAINTENANCE"
                        ? "BẢO TRÌ"
                        : order.statusName === "TECHNICALLY_COMPLETED"
                        ? "ĐÃ HOÀN THÀNH KỸ THUẬT"
                        : order.statusName === "COMPLETED"
                        ? "HOÀN THÀNH"
                        : order.statusName}
                    </span>
                  </div>
                  <p className="card-text mb-1">
                    <i className="fas fa-dollar-sign me-2 text-warning"></i>
                    <strong>Tổng Giá:</strong>{" "}
                    {(order.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
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
                  <p className="card-text mb-1">
                    <i className="fas fa-money-bill-wave me-2 text-warning"></i>
                    <strong>Trạng Thái Thanh Toán:</strong>{" "}
                    <span
                      className={`badge ${
                        order.paymentStatus === "FULLY_PAID"
                          ? "bg-success"
                          : order.paymentStatus === "DEPOSIT_PAID"
                          ? "bg-info"
                          : "bg-danger"
                      }`}
                    >
                      {paymentStatusOptions.find(
                        (opt) => opt.value === order.paymentStatus
                      )?.label || "Chưa thanh toán"}
                    </span>
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        style={{ maxWidth: 700 }}
        styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
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
                  <strong>Mô Tả:</strong>{" "}
                  {selectedOrder.description ? (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: showFullDescription
                            ? selectedOrder.description
                            : selectedOrder.description.slice(0, 100) + "...",
                        }}
                      />
                      <button
                        className="btn btn-link btn-sm p-0 ms-2"
                        onClick={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                      >
                        {showFullDescription ? "Thu gọn" : "Xem thêm"}
                      </button>
                    </>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p>
                  <i className="fas fa-dollar-sign text-warning me-2"></i>
                  <strong>Tổng Giá:</strong>{" "}
                  {selectedOrder.totalPrice != null
                    ? `${Number(selectedOrder.totalPrice).toLocaleString(
                        "vi-VN"
                      )} VNĐ`
                    : "N/A"}
                </p>
                <p>
                  <i className="fas fa-piggy-bank text-orange me-2"></i>
                  <strong>Số Tiền Đặt Cọc:</strong>{" "}
                  {selectedOrder.depositAmount != null
                    ? `${Number(selectedOrder.depositAmount).toLocaleString(
                        "vi-VN"
                      )} VNĐ`
                    : "N/A"}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <i className="fas fa-chart-line text-warning me-2"></i>
                  <strong>Trạng Thái:</strong>{" "}
                  <span
                    className={`badge ${
                      selectedOrder.statusName === "IN_PROGRESS"
                        ? "bg-primary"
                        : selectedOrder.statusName === "APPROVED"
                        ? "bg-success"
                        : selectedOrder.statusName === "PENDING"
                        ? "bg-warning text-dark"
                        : selectedOrder.statusName === "TECHNICALLY_COMPLETED"
                        ? "bg-info"
                        : selectedOrder.statusName === "COMPLETED"
                        ? "bg-success"
                        : "bg-secondary"
                    } text-white`}
                  >
                    {selectedOrder.statusName === "IN_PROGRESS"
                      ? "ĐANG THỰC HIỆN"
                      : selectedOrder.statusName === "APPROVED"
                      ? "ĐÃ DUYỆT"
                      : selectedOrder.statusName === "PENDING"
                      ? "CHỜ DUYỆT"
                      : selectedOrder.statusName === "PLANNING"
                      ? "ĐANG LÊN KẾ HOẠCH"
                      : selectedOrder.statusName === "ON_HOLD"
                      ? "TẠM DỪNG"
                      : selectedOrder.statusName === "CANCELLED"
                      ? "ĐÃ HỦY"
                      : selectedOrder.statusName === "MAINTENANCE"
                      ? "BẢO TRÌ"
                      : selectedOrder.statusName === "TECHNICALLY_COMPLETED"
                      ? "ĐÃ HOÀN THÀNH KỸ THUẬT"
                      : selectedOrder.statusName === "COMPLETED"
                      ? "HOÀN THÀNH"
                      : selectedOrder.statusName || "N/A"}
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
                <p>
                  <i className="fas fa-money-bill-wave text-warning me-2"></i>
                  <strong>Trạng Thái Thanh Toán:</strong>{" "}
                  <span
                    className={`badge ${
                      selectedOrder.paymentStatus === "FULLY_PAID"
                        ? "bg-success"
                        : selectedOrder.paymentStatus === "DEPOSIT_PAID"
                        ? "bg-info"
                        : "bg-danger"
                    }`}
                  >
                    {paymentStatusOptions.find(
                      (opt) => opt.value === selectedOrder.paymentStatus
                    )?.label || "Chưa thanh toán"}
                  </span>
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
                      <td>
                        {task.status === "COMPLETED"
                          ? "HOÀN THÀNH"
                          : task.status === "PENDING"
                          ? "ĐANG CHỜ"
                          : task.status === "IN_PROGRESS"
                          ? "ĐANG THỰC HIỆN"
                          : task.status === "in process"
                          ? "ĐANG XỬ LÝ"
                          : task.status === "ĐANG CHỜ"
                          ? "ĐANG CHỜ"
                          : task.status}
                      </td>
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
        open={isReviewModalVisible}
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
        open={isMaintenanceModalVisible}
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
          <Form.Item 
            name="attachments" 
            label="Ảnh Đính Kèm"
          >
            <Upload.Dragger
              multiple={true}
              beforeUpload={() => false}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <i className="fas fa-cloud-upload-alt fa-2x text-primary"></i>
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào đây</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={maintenanceLoading || uploading}
              disabled={uploading}
            >
              {uploading ? "Đang tải lên..." : "Gửi Yêu Cầu"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <span className={`payment-status ${paymentStatus}`}>
        {paymentStatus === "success" && "Thanh toán thành công"}
        {paymentStatus === "pending" && "Chờ thanh toán"}
        {paymentStatus === "failed" && "Thanh toán thất bại"}
      </span>
    </div>
  );
};

export default OrdersCustomer;
