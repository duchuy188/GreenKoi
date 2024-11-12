import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Descriptions,
  message,
  Image,
  Rate,
  Input,
  Space,
  Select,
  Card,
  DatePicker,
} from "antd";
import { DeleteOutlined, SearchOutlined, EyeOutlined, WalletOutlined, ToolOutlined, StarOutlined } from "@ant-design/icons";
import api from "/src/components/config/axios";
import moment from "moment";
import "./Cusmaintenance.css";

function Cusmaintenance() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [searchDate, setSearchDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    searchDate: null,
    statusFilter: "ALL",
    paymentFilter: "ALL"
  });
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [cancellationModalVisible, setCancellationModalVisible] = useState(false);
  const [selectedCancellation, setSelectedCancellation] = useState(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const statusOptions = [
    { value: "ALL", label: "Tất Cả Trạng Thái" },
    { value: "PENDING", label: "Đang Xem Xét" },
    { value: "CONFIRMED", label: "Đã Xác Nhận" },
    { value: "COMPLETED", label: "Hoàn Thành" },
    { value: "CANCELLED", label: "Đã Hủy" },
  ];

  const paymentOptions = [
    { value: "ALL", label: "Tất Cả Thanh Toán" },
    { value: "UNPAID", label: "Chưa Thanh Toán" },
    { value: "DEPOSIT_PAID", label: "Đã Cọc" },
    { value: "FULLY_PAID", label: "Đã Thanh Toán" },
  ];

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customerId");

      if (!customerId || !token) {
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      const response = await api.get(
        `/api/maintenance-requests/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedData = response.data
        .map((item) => ({
          ...item,
          review: {
            rating: item.rating || 0,
            comment: item.comment || '',
            reviewDate: item.reviewDate
          },
          key: item.id,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMaintenanceRequests(formattedData);
    } catch (err) {
      console.error("Error fetching maintenance requests:", err);
      message.error("Không thể tải danh sách yêu cầu bảo trì");
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customerId");

      if (!rating) {
        message.error("Vui lòng chọn số sao đánh giá");
        return;
      }

      const reviewData = {
        rating: rating,
        comment: comment,
        customerId: customerId
      };

      await api.post(
        `/api/maintenance-requests/${selectedRequest.id}/review`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Đánh giá đã được gửi thành công");
      setReviewModalVisible(false);
      setRating(0);
      setComment("");
      
      await fetchMaintenanceRequests();
    } catch (err) {
      console.error("Error submitting review:", err);
      if (err.response?.status === 500) {
        message.error("Yêu cầu này đã được đánh giá trước đó");
      } else {
        message.error(
          err.response?.data?.message || 
          "Không thể gửi đánh giá. Vui lòng thử lại sau."
        );
      }
    }
  };

  const getFilteredData = () => {
    return maintenanceRequests.filter(item => {
      const matchStatus = statusFilter === "ALL" ? true : 
        item.requestStatus === statusFilter;
      const matchPayment = paymentFilter === "ALL" ? true : 
        item.paymentStatus === paymentFilter;
      const matchDate = !searchDate ? true : 
        moment(item.createdAt).format('YYYY-MM-DD') === searchDate.format('YYYY-MM-DD');
      return matchStatus && matchPayment && matchDate;
    });
  };

  const handleApplyFilters = () => {
    setSearchDate(tempFilters.searchDate);
    setStatusFilter(tempFilters.statusFilter);
    setPaymentFilter(tempFilters.paymentFilter);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setTempFilters({
      searchDate: null,
      statusFilter: "ALL",
      paymentFilter: "ALL"
    });
    setSearchDate(null);
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setFilterModalVisible(false);
  };

  const renderFilterModal = () => (
    <Modal
      title="Lọc Thông Tin"
      visible={filterModalVisible}
      onCancel={() => setFilterModalVisible(false)}
      footer={[
        <Button key="reset" onClick={handleResetFilters}>
          Đặt Lại
        </Button>,
        <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
          Đóng
        </Button>,
        <Button key="apply" type="primary" onClick={handleApplyFilters}>
          Áp Dụng
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ marginBottom: 8 }}>Ngày Yêu Cầu:</div>
          <DatePicker
            placeholder="Chọn ngày yêu cầu"
            value={tempFilters.searchDate}
            onChange={value => setTempFilters({...tempFilters, searchDate: value})}
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            allowClear
          />
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>Trạng Thái:</div>
          <Select
            value={tempFilters.statusFilter}
            onChange={value => setTempFilters({...tempFilters, statusFilter: value})}
            style={{ width: '100%' }}
            options={statusOptions}
          />
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>Thanh Toán:</div>
          <Select
            value={tempFilters.paymentFilter}
            onChange={value => setTempFilters({...tempFilters, paymentFilter: value})}
            style={{ width: '100%' }}
            options={paymentOptions}
          />
        </div>
      </Space>
    </Modal>
  );

  const actionButtonStyle = {
    width: '100%',
    marginBottom: '8px',
    borderRadius: '4px',
    height: '32px',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const fetchReviewData = async (maintenanceRequestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/api/maintenance-requests/${maintenanceRequestId}/review`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching review:", err);
      message.error("Không thể tải thông tin đánh giá");
      return null;
    }
  };

  const handleViewReview = async (record) => {
    const reviewData = await fetchReviewData(record.id);
    
    if (!reviewData) return;

    Modal.info({
      title: 'Đánh Giá Của Bạn',
      content: (
        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Số sao:</div>
            <Rate disabled value={reviewData.rating} />
          </div>
          {reviewData.comment && (
            <div>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Nhận xét:</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{reviewData.comment}</p>
            </div>
          )}
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            Ngày đánh giá: {moment(reviewData.reviewDate).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
      width: 500,
      okText: 'Đóng',
    });
  };

  const handleViewCancellation = (reason) => {
    setSelectedCancellation(reason);
    setCancellationModalVisible(true);
  };

  const handleVNPayPayment = async (record) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/api/maintenance-requests/${record.id}/deposit/vnpay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        message.error("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Error creating VNPay payment:", err);
      message.error(
        err.response?.data?.message || 
        "Không thể xử lý thanh toán. Vui lòng thử lại sau."
      );
    }
  };

  const handleFinalVNPayPayment = async (record) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/api/maintenance-requests/${record.id}/final/vnpay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        message.error("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Error creating final VNPay payment:", err);
      message.error(
        err.response?.data?.message || 
        "Không thể xử lý thanh toán. Vui lòng thử lại sau."
      );
    }
  };

  const handleViewAttachments = (attachments) => {
    if (!attachments) return;
    const imageList = attachments.split(',').filter(url => url.trim());
    setPreviewImages(imageList);
    setImagePreviewVisible(true);
  };

  const columns = [
    {
      title: "TÊN DỰ ÁN",
      dataIndex: "projectName",
      key: "projectName",
      width: 200,
    },
    {
      title: "TRẠNG THÁI YÊU CẦU",
      dataIndex: "requestStatus",
      key: "requestStatus",
      width: 150,
      render: (status) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          backgroundColor: 
            status === 'PENDING' ? '#fff7e6' :
            status === 'REVIEWING' ? '#e6f7ff' :
            status === 'CONFIRMED' ? '#e6f7ff' :
            status === 'COMPLETED' ? '#f6ffed' :
            status === 'CANCELLED' ? '#fff1f0' : '#f0f0f0',
          color: 
            status === 'PENDING' ? '#faad14' :
            status === 'REVIEWING' ? '#1890ff' :
            status === 'CONFIRMED' ? '#1890ff' :
            status === 'COMPLETED' ? '#52c41a' :
            status === 'CANCELLED' ? '#f5222d' : '#000000',
          border: `1px solid ${
            status === 'PENDING' ? '#ffd591' :
            status === 'REVIEWING' ? '#91d5ff' :
            status === 'CONFIRMED' ? '#91d5ff' :
            status === 'COMPLETED' ? '#b7eb8f' :
            status === 'CANCELLED' ? '#ffa39e' : '#d9d9d9'
          }`
        }}>
          {status === 'PENDING' ? 'Đang Giải Quyết' :
           status === 'REVIEWING' ? 'Đang Xem Xét' :
           status === 'CONFIRMED' ? 'Đã Xác Nhận' :
           status === 'COMPLETED' ? 'Hoàn Thành' :
           status === 'CANCELLED' ? 'Đã Hủy' : status}
        </span>
      ),
    },
    {
      title: "THANH TOÁN",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 150,
      render: (status) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          backgroundColor: 
            status === 'UNPAID' ? '#fff1f0' :
            status === 'DEPOSIT_PAID' ? '#fff7e6' :
            status === 'FULLY_PAID' ? '#f6ffed' : '#f0f0f0',
          color: 
            status === 'UNPAID' ? '#f5222d' :
            status === 'DEPOSIT_PAID' ? '#faad14' :
            status === 'FULLY_PAID' ? '#52c41a' : '#000000',
          border: `1px solid ${
            status === 'UNPAID' ? '#ffa39e' :
            status === 'DEPOSIT_PAID' ? '#ffd591' :
            status === 'FULLY_PAID' ? '#b7eb8f' : '#d9d9d9'
          }`
        }}>
          {status === 'UNPAID' ? 'Chưa Thanh Toán' :
           status === 'DEPOSIT_PAID' ? 'Đã Cọc' :
           status === 'FULLY_PAID' ? 'Đã Thanh Toán' : status}
        </span>

      ),
    },
    {
      title: "PHƯƠNG THỨC THANH TOÁN",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 150,
      render: (method) => {
        let style = {
          padding: '4px 12px',
          borderRadius: '4px',
          display: 'inline-block',
          textAlign: 'center'
        };

        if (method === 'CASH') {
          style = {
            ...style,
            backgroundColor: '#fff7e6',
            color: '#faad14',
            border: '1px solid #ffd591'
          };
          return <span style={style}>Tiền Mặt</span>;
        } else if (method === 'VNPAY') {
          style = {
            ...style,
            backgroundColor: '#e6f7ff',
            color: '#1890ff',
            border: '1px solid #91d5ff'
          };
          return <span style={style}>Ngân Hàng</span>;
        }

        return <span style={{
          ...style,
          backgroundColor: '#f5f5f5',
          color: '#8c8c8c',
          border: '1px solid #d9d9d9'
        }}>Chưa có</span>;
      },
    },
    {
      title: "TÀI LIỆU ĐÍNH KÈM",
      dataIndex: "attachments",
      key: "attachments",
      width: 150,
      render: (attachments) => (
        <div>
          {attachments ? (
            <Button 
              type="link" 
              onClick={() => handleViewAttachments(attachments)}
            >
              Xem {attachments.split(',').filter(url => url.trim()).length} tệp đính kèm
            </Button>
          ) : (
            "Không có"
          )}
        </div>
      ),
    },
    {
      title: "CẬP NHẬT",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "LÝ DO HỦY",
      dataIndex: "cancellationReason",
      key: "cancellationReason",
      width: 150,
      render: (reason) => (
        <Button 
          type="link"
          onClick={() => handleViewCancellation(reason)}
          disabled={!reason}
        >
          {reason ? "Xem lý do" : "Không có"}
        </Button>
      ),
    },
   
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      width: 150,
      render: (_, record) => (
        <div>
          <Button
            style={{
              ...actionButtonStyle,
              backgroundColor: '#ffc107',
              marginBottom: '8px'
            }}
            onClick={() => handleViewDetails(record)}
          >
            <EyeOutlined /> Chi Tiết
          </Button>
          
          {record.requestStatus === 'CONFIRMED' && record.paymentStatus === 'UNPAID' && (
            <Button
              style={{
                ...actionButtonStyle,
                backgroundColor: '#1890ff',
                marginBottom: '8px'
              }}
              onClick={() => handleVNPayPayment(record)}
            >
              <WalletOutlined /> Thanh Toán Đặt Cọc
            </Button>
          )}

          {record.maintenanceStatus === 'COMPLETED' && record.paymentStatus === 'DEPOSIT_PAID' && (
            <Button
              style={{
                ...actionButtonStyle,
                backgroundColor: '#52c41a',
                marginBottom: '8px'
              }}
              onClick={() => handleFinalVNPayPayment(record)}
            >
              <WalletOutlined /> Thanh Toán Cuối Cùng
            </Button>
          )}

          {record.paymentStatus === 'FULLY_PAID' && (
            <>
              {record.rating > 0 ? (
                <Button
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: '#13c2c2'
                  }}
                  onClick={() => handleViewReview(record)}
                >
                  <StarOutlined /> Xem Đánh Giá
                </Button>
              ) : (
                <Button
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: '#722ed1'
                  }}
                  onClick={() => handleOpenReview(record)}
                >
                  <StarOutlined /> Đánh Giá
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    const renderMaintenanceStatus = (status) => {
      const style = {
        padding: '4px 12px',
        borderRadius: '4px',
        backgroundColor: 
          status === 'NOT_STARTED' ? '#f0f0f0' :
          status === 'ASSIGNED' ? '#fff7e6' :
          status === 'SCHEDULED' ? '#e6f7ff' :
          status === 'IN_PROGRESS' ? '#e6f7ff' :
          status === 'COMPLETED' ? '#f6ffed' : '#f0f0f0', 
        color: 
          status === 'NOT_STARTED' ? '#000000' :
          status === 'ASSIGNED' ? '#faad14' :
          status === 'SCHEDULED' ? '#1890ff' :
          status === 'IN_PROGRESS' ? '#1890ff' :
          status === 'COMPLETED' ? '#52c41a' : '#000000',
        border: `1px solid ${
          status === 'NOT_STARTED' ? '#d9d9d9' :
          status === 'ASSIGNED' ? '#ffd591' :
          status === 'SCHEDULED' ? '#91d5ff' :
          status === 'IN_PROGRESS' ? '#91d5ff' :
          status === 'COMPLETED' ? '#b7eb8f' : '#d9d9d9'
        }`
      };

      return (
        <span style={style}>
          {status === 'NOT_STARTED' ? 'Chưa Bắt Đầu' :
           status === 'ASSIGNED' ? 'Đã Phân Công' :
           status === 'SCHEDULED' ? 'Đã Đặt Lịch' :
           status === 'IN_PROGRESS' ? 'Đang Thực Hiện' :
           status === 'COMPLETED' ? 'Hoàn Thành' : status}
        </span>
      );
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    return (
      <Modal
        title={`Chi tiết yêu cầu bảo trì`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên Dự Án">
            {selectedRequest.projectName}
          </Descriptions.Item>

          <Descriptions.Item label="Mô Tả">
            {selectedRequest.description}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng Thái Bảo Trì">
            {renderMaintenanceStatus(selectedRequest.maintenanceStatus)}
          </Descriptions.Item>

          <Descriptions.Item label="Giá Thỏa Thuận">
            {formatCurrency(selectedRequest.agreedPrice)}
          </Descriptions.Item>

          <Descriptions.Item label="Thời Gian">
            <div>Ngày hẹn: {moment(selectedRequest.scheduledDate).format("DD/MM/YYYY")}</div>
            <div>Ngày bắt đầu: {selectedRequest.startDate ? moment(selectedRequest.startDate).format("DD/MM/YYYY") : "Chưa xác định"}</div>
            <div>Ngày hoàn thành: {selectedRequest.completionDate ? moment(selectedRequest.completionDate).format("DD/MM/YYYY") : "Chưa hoàn thành"}</div>
          </Descriptions.Item>

          <Descriptions.Item label="Nhân Viên Phụ Trách">
            {selectedRequest.assignedToName || "Chưa phân công"}
          </Descriptions.Item>

          <Descriptions.Item label="Tư Vấn Viên">
            {selectedRequest.consultantName || "Chưa có"}
          </Descriptions.Item>

          <Descriptions.Item label="Ghi Chú Bảo Trì">
            {selectedRequest.maintenanceNotes}
          </Descriptions.Item>

          <Descriptions.Item label="Hình Ảnh Bảo Trì">
            {selectedRequest.maintenanceImages && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedRequest.maintenanceImages.map((url, index) => (
                  <Image
                    key={index}
                    width={100}
                    src={url}
                    alt={`Maintenance Image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  const handleOpenReview = (record) => {
    if (record.review?.rating) {
      message.warning("Yêu cầu này đã được đánh giá trước đó");
      return;
    }
    setSelectedRequest(record);
    setReviewModalVisible(true);
    setRating(0);
    setComment("");
  };

  const renderReviewModal = () => (
    <Modal
      title="Đánh Giá Dịch Vụ"
      visible={reviewModalVisible}
      onCancel={() => {
        setReviewModalVisible(false);
        setRating(0);
        setComment("");
      }}
      footer={[
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmitReview}
          disabled={!rating}
        >
          Gửi Đánh Giá
        </Button>,
        <Button 
          key="cancel" 
          onClick={() => {
            setReviewModalVisible(false);
            setRating(0);
            setComment("");
          }}
        >
          Hủy
        </Button>
      ]}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Đánh Giá Sao:</div>
          <Rate 
            value={rating}
            onChange={setRating}
            style={{ fontSize: 24 }}
          />
        </div>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Nhận Xét:</div>
          <Input.TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập nhận xét của bạn về dịch vụ..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </div>
    </Modal>
  );

  const renderCancellationModal = () => (
    <Modal
      title="Lý Do Hủy"
      visible={cancellationModalVisible}
      onCancel={() => setCancellationModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setCancellationModalVisible(false)}>
          Đóng
        </Button>
      ]}
    >
      <div style={{ 
        padding: '16px',
        background: '#f5f5f5',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {selectedCancellation || "Không có"}
      </div>
    </Modal>
  );

  const renderImagePreviewModal = () => (
    <Modal
      title="Hình Ảnh Đính Kèm"
      visible={imagePreviewVisible}
      onCancel={() => setImagePreviewVisible(false)}
      footer={null}
      width={800}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        padding: '16px'
      }}>
        {previewImages.map((imageUrl, index) => (
          <Image
            key={index}
            width={200}
            src={imageUrl}
            alt={`Image ${index + 1}`}
          />
        ))}
      </div>
    </Modal>
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'

      }}>
        <h1 style={{ 
          margin: 0,
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1890ff'
        }}>
          <ToolOutlined style={{ marginRight: '8px' }} />
          Danh Sách Yêu Cầu Bảo Trì
        </h1>
        <Button 
          type="primary" 
          onClick={() => setFilterModalVisible(true)}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <SearchOutlined /> Lọc
        </Button>
      </div>
      <Table 
        dataSource={getFilteredData()} 
        columns={columns} 
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} yêu cầu`,
        }}
        className="maintenance-table"
      />
      {renderDetailModal()}
      {renderFilterModal()}
      {renderReviewModal()}
      {renderCancellationModal()}
      {renderImagePreviewModal()}
    </div>
  );
}

export default Cusmaintenance;
