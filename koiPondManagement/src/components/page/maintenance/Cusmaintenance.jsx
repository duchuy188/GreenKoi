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
} from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import api from "/src/components/config/axios";
import moment from "moment";

function Cusmaintenance() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

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
    { value: "PAID", label: "Đã Thanh Toán" },
  ];

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customerId");

      if (!customerId) {
        throw new Error("No customer ID found");
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
          attachments: item.attachments ? item.attachments.split(',') : [],
          key: item.id,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMaintenanceRequests(formattedData);
    } catch (err) {
      console.error("Error fetching maintenance requests:", err);
      message.error("Không thể tải danh sách yêu cầu bảo trì");
    }
  };

  const handleMaintenanceCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/api/maintenance-requests/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Maintenance request cancelled successfully");
      fetchMaintenanceRequests();
    } catch (err) {
      console.error("Error cancelling maintenance request:", err);
      message.error("Failed to cancel maintenance request");
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

      const reviewData = {
        maintenanceRequestId: selectedRequest.id,
        projectId: selectedRequest.projectId,
        customerId: customerId,
        rating: rating,
        comment: comment,
        status: "SUBMITTED"
      };

      await api.post(
        `/api/maintenance-requests/${selectedRequest.id}/review`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Đánh giá đã được gửi thành công");
      setDetailModalVisible(false);
      fetchMaintenanceRequests();
    } catch (err) {
      console.error("Error submitting review:", err);
      message.error("Không thể gửi đánh giá");
    }
  };

  const getFilteredData = () => {
    return maintenanceRequests.filter(item => {
      const matchStatus = statusFilter === "ALL" ? true : 
        item.requestStatus === statusFilter;
      const matchPayment = paymentFilter === "ALL" ? true : 
        item.paymentStatus === paymentFilter;
      const matchSearch = searchText === "" ? true : 
        (item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
         item.id?.toString().includes(searchText));
      return matchStatus && matchPayment && matchSearch;
    });
  };

  const renderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Space size="large">
        <div>
          <span style={{ marginRight: 8 }}>Tìm Kiếm:</span>
          <Input
            placeholder="Tìm theo mã đơn hoặc ghi chú"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            allowClear
          />
        </div>
        <div>
          <span style={{ marginRight: 8 }}>Trạng Thái:</span>
          <Select
            value={statusFilter}
            onChange={value => setStatusFilter(value)}
            style={{ width: 150 }}
            options={statusOptions}
          />
        </div>
        <div>
          <span style={{ marginRight: 8 }}>Thanh Toán:</span>
          <Select
            value={paymentFilter}
            onChange={value => setPaymentFilter(value)}
            style={{ width: 150 }}
            options={paymentOptions}
          />
        </div>
      </Space>
    </Card>
  );

  const columns = [
    {
      title: "HÌNH ẢNH",
      dataIndex: "attachments",
      key: "attachments",
      render: (attachments) => (
        <Image
          width={50}
          src={attachments?.[0] || '/placeholder-image.png'}
          alt="Attachment"
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: "NGÀY YÊU CẦU",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("DD/MM/YYYY"),
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: (status) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          backgroundColor: 
            status === 'PENDING' ? '#fff7e6' :
            status === 'CONFIRMED' ? '#e6f7ff' :
            status === 'COMPLETED' ? '#f6ffed' :
            status === 'CANCELLED' ? '#fff1f0' : '#f0f0f0',
          color: 
            status === 'PENDING' ? '#faad14' :
            status === 'CONFIRMED' ? '#1890ff' :
            status === 'COMPLETED' ? '#52c41a' :
            status === 'CANCELLED' ? '#f5222d' : '#000000',
          border: `1px solid ${
            status === 'PENDING' ? '#ffd591' :
            status === 'CONFIRMED' ? '#91d5ff' :
            status === 'COMPLETED' ? '#b7eb8f' :
            status === 'CANCELLED' ? '#ffa39e' : '#d9d9d9'
          }`
        }}>
          {status === 'PENDING' ? 'Đang Xem Xét' :
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
      render: (status) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          backgroundColor: 
            status === 'UNPAID' ? '#fff1f0' :
            status === 'DEPOSIT_PAID' ? '#fff7e6' :
            status === 'PAID' ? '#f6ffed' : '#f0f0f0',
          color: 
            status === 'UNPAID' ? '#f5222d' :
            status === 'DEPOSIT_PAID' ? '#faad14' :
            status === 'PAID' ? '#52c41a' : '#000000',
          border: `1px solid ${
            status === 'UNPAID' ? '#ffa39e' :
            status === 'DEPOSIT_PAID' ? '#ffd591' :
            status === 'PAID' ? '#b7eb8f' : '#d9d9d9'
          }`
        }}>
          {status === 'UNPAID' ? 'Chưa Thanh Toán' :
           status === 'DEPOSIT_PAID' ? 'Đã Cọc' :
           status === 'PAID' ? 'Đã Thanh Toán' : status}
        </span>
      ),
    },
    {
      title: "GHI CHÚ",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            type="link"
            onClick={() => handleViewDetails(record)}
          >
            Xem Chi Tiết
          </Button>
          {record.requestStatus === "PENDING" && (
            <Button
              type="link"
              danger
              onClick={() => handleMaintenanceCancel(record.id)}
            >
              Hủy
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    const renderPaymentStatus = (status) => {
      const style = {
        padding: '4px 12px',
        borderRadius: '4px',
        fontWeight: 'bold'
      };

      if (status === 'UNPAID') {
        return <span style={{ ...style, backgroundColor: '#fff1f0', color: '#f5222d' }}>Chưa Thanh Toán</span>;
      } else if (status === 'DEPOSIT_PAID') {
        return <span style={{ ...style, backgroundColor: '#fff7e6', color: '#faad14' }}>Đã Cọc</span>;
      } else if (status === 'PAID') {
        return <span style={{ ...style, backgroundColor: '#f6ffed', color: '#52c41a' }}>Đã Thanh Toán</span>;
      }
      return status;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    return (
      <Modal
        title={`Chi tiết yêu cầu bảo trì #${selectedRequest.id}`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          selectedRequest.requestStatus === "COMPLETED" && !selectedRequest.review && (
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleSubmitReview}
              disabled={!rating}
            >
              Gửi Đánh Giá
            </Button>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Thời Gian">
            <div>Bắt đầu: {moment(selectedRequest.createdAt).format("DD/MM/YYYY")}</div>
            <div>Kết thúc: {moment(selectedRequest.completionDate || selectedRequest.createdAt).format("DD/MM/YYYY")}</div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Mã Dự Án">
            {selectedRequest.projectId}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng Thái Yêu Cầu">
            {selectedRequest.requestStatus === 'PENDING' ? 'Đang Xem Xét' :
             selectedRequest.requestStatus === 'CONFIRMED' ? 'Đã Xác Nhận' :
             selectedRequest.requestStatus === 'COMPLETED' ? 'Hoàn Thành' :
             selectedRequest.requestStatus === 'CANCELLED' ? 'Đã Hủy' : 
             selectedRequest.requestStatus}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng Thái Thanh Toán">
            {renderPaymentStatus(selectedRequest.paymentStatus)}
          </Descriptions.Item>

          <Descriptions.Item label="Phương Thức Thanh Toán">
            {selectedRequest.paymentMethod === 'CASH' ? 'Tiền Mặt' : 
             selectedRequest.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển Khoản' : 
             selectedRequest.paymentMethod}
          </Descriptions.Item>

          <Descriptions.Item label="Tiền Cọc">
            {formatCurrency(selectedRequest.depositAmount)}
          </Descriptions.Item>

          <Descriptions.Item label="Số Tiền Còn Lại">
            {formatCurrency(selectedRequest.remainingAmount)}
          </Descriptions.Item>

          <Descriptions.Item label="Hình Ảnh Yêu Cầu">
            {selectedRequest.attachments && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedRequest.attachments.map((url, index) => (
                  <Image
                    key={index}
                    width={100}
                    src={url}
                    alt={`Attachment ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Ghi Chú">
            {selectedRequest.description}
          </Descriptions.Item>

          {selectedRequest.requestStatus === "COMPLETED" && !selectedRequest.review && (
            <>
              <Descriptions.Item label="Đánh Giá">
                <Rate 
                  value={rating} 
                  onChange={setRating} 
                  style={{ fontSize: 20 }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Nhận Xét">
                <Input.TextArea 
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét của bạn về dịch vụ bảo trì..."
                />
              </Descriptions.Item>
            </>
          )}

          {selectedRequest.review && (
            <>
              <Descriptions.Item label="Đánh Giá">
                <Rate 
                  disabled 
                  value={selectedRequest.review.rating} 
                  style={{ fontSize: 20 }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Nhận Xét">
                {selectedRequest.review.comment}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Đánh Giá">
                {moment(selectedRequest.review.reviewDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Modal>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      {renderFilters()}
      <Table 
        dataSource={getFilteredData()} 
        columns={columns} 
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} yêu cầu`,
        }}
      />
      {renderDetailModal()}
    </div>
  );
}

export default Cusmaintenance;
