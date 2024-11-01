import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Descriptions,
  Image,
  message,
  Select,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
} from "antd";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import moment from 'moment';

// Add a helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const MaintenanceRequest = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [form] = Form.useForm();
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingRequestId, setCancellingRequestId] = useState(null);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [statusFilter]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/maintenance-requests/${statusFilter.toLowerCase()}`);
      console.log("API response:", response.data);
      setMaintenanceRequests(response.data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error("Không thể tải danh sách yêu cầu bảo trì");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleViewMaintenanceDetails = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    if (record.requestStatus === "REVIEWING") {
      form.setFieldsValue({
        id: record.id,
        customerId: record.customerId,
        projectId: record.projectId,
        description: record.description,
        requestStatus: record.requestStatus,
        maintenanceStatus: record.maintenanceStatus,
        scheduledDate: record.scheduledDate,
        agreedPrice: record.agreedPrice,
        assignedTo: record.assignedTo,
        maintenanceNotes: record.maintenanceNotes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        attachments: record.attachments,
        
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  const handleStartReview = async (id) => {
    try {
      const response = await api.patch(`/api/maintenance-requests/${id}/review`);
      if (response.status === 200) {
        message.success("Bắt đầu xem xét yêu cầu bảo trì thành công");
        fetchMaintenanceRequests(); 
      }
    } catch (error) {
      console.error("Error starting review:", error);
      toast.error("Không thể bắt đầu xem xét yêu cầu bảo trì");
    }
  };

  const handleUpdateMaintenanceRequest = async (values) => {
    try {
      const remainingAmount = values.agreedPrice - values.depositAmount;

      const response = await api.patch(`/api/maintenance-requests/${selectedRecord.id}/confirm`, {
        agreedPrice: values.agreedPrice,
        paymentStatus: 'DEPOSIT_PAID',
        paymentMethod: values.paymentMethod,
        depositAmount: values.depositAmount,
        remainingAmount: remainingAmount,
        requestStatus: 'CONFIRMED'
      });

      if (response.status === 200) {
        if (values.paymentMethod === 'CASH') {
          await api.post(`/api/maintenance-requests/${selectedRecord.id}/deposit/cash`);
        }

        message.success("Cập nhật và xác nhận đặt cọc thành công");
        setIsModalVisible(false);
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast.error("Không thể cập nhật");
    }
  };

  const handleCancelRequest = (id) => {
    setCancellingRequestId(id);
    setIsCancelModalVisible(true);
  };

  const handleCancelModalOk = async () => {
    try {
      if (!cancellationReason.trim()) {
        message.error("Vui lòng nhập lý do hủy yêu cầu");
        return;
      }

      const response = await api.patch(`/api/maintenance-requests/${cancellingRequestId}/cancel`, {
        cancellationReason: cancellationReason
      });

      if (response.status === 200) {
        message.success("Yêu cầu bảo trì đã được hủy thành công");
        setIsCancelModalVisible(false);
        setCancellationReason('');
        setCancellingRequestId(null);
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error("Error canceling maintenance request:", error);
      toast.error("Không thể hủy yêu cầu bảo trì");
    }
  };

  const handleCancelModalCancel = () => {
    setIsCancelModalVisible(false);
    setCancellationReason('');
    setCancellingRequestId(null);
  };

  const handleUpdatePaymentStatus = async (values) => {
    try {
      const response = await api.patch(`/api/maintenance-requests/${selectedRecord.id}/payment-status`, {
        paymentStatus: values.paymentStatus
      });
      if (response.status === 200) {
        message.success("Cập nhật trạng thái thanh toán thành công");
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Không thể cập nhật trạng thái thanh toán");
    }
  };

  const handleFinalPayment = async (record) => {
    try {
      const updateResponse = await api.patch(`/api/maintenance-requests/${record.id}/payment-status`, {
        paymentStatus: 'FULLY_PAID'
      });

      if (updateResponse.status === 200) {
        if (record.paymentMethod === 'CASH') {
          await api.post(`/api/maintenance-requests/${record.id}/final/cash`);
        }

        message.success("Thanh toán cuối cùng đã được xác nhận");
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error("Error processing final payment:", error);
      toast.error("Không thể xử lý thanh toán cuối cùng");
    }
  };

  const columns = [
    {
      title: "Hình Ảnh",
      dataIndex: "attachments",
      key: "attachments",
      render: (attachments) => (
        attachments && typeof attachments === 'string' ? (
          <Image
            width={50}
            src={attachments}
            alt="Attachment"
          />
        ) : null
      ),
    },
    { title: "ID", dataIndex: "id", key: "id", hidden: true },
    { title: "Customer ID", dataIndex: "customerId", key: "customerId", hidden: true },
    { title: "Project ID", dataIndex: "projectId", key: "projectId", hidden: true },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Trạng thái yêu cầu",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: (status) => {
        switch (status) {
          case "PENDING":
            return "Đang chờ";
          case "REVIEWING":
            return "Đang xem xét";
          case "CANCELLED":
            return "Đã hủy";
          default:
            return status;
        }
      }
    },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss') },
    { title: "Ngày cập nhật", dataIndex: "updatedAt", key: "updatedAt", render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss') },
    { title: "Trạng thái bảo trì", dataIndex: "maintenanceStatus", key: "maintenanceStatus", hidden: true },
    { title: "Ngày lên lịch", dataIndex: "scheduledDate", key: "scheduledDate", hidden: true },
    { 
      title: "Trạng thái thanh toán", 
      dataIndex: "paymentStatus", 
      key: "paymentStatus",
      render: (status) => {
        switch (status) {
          case "UNPAID":
            return "Chưa thanh toán";
          case "DEPOSIT_PAID":
            return "Đã cọc";
          case "FULLY_PAID":
            return "Đã thanh toán";
          default:
            return status;
        }
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.requestStatus !== "PENDING" && (
            <Button onClick={() => handleViewMaintenanceDetails(record)}>
              View Details
            </Button>
          )}
          {record.requestStatus === "PENDING" && (
            <Button onClick={() => handleStartReview(record.id)}>
              Start Review
            </Button>
          )}
          {record.requestStatus === "REVIEWING" && (
            <Button onClick={() => handleCancelRequest(record.id)} danger>
              Cancel Request
            </Button>
          )}
          {record.paymentStatus === "DEPOSIT_PAID" && (
            <Button onClick={() => handleFinalPayment(record)}>
              Confirm Final Payment
            </Button>
          )}
        </Space>
      ),
      hidden: statusFilter === "CANCELLED"
    },
    { 
      title: "Cancellation Reason", 
      dataIndex: "cancellationReason", 
      key: "cancellationReason",
      render: (text, record) => record.requestStatus === "CANCELLED" ? text : "-",
      hidden: statusFilter !== "CANCELLED"
    },
  ];

  const renderModalContent = () => {
    if (!selectedRecord) return null;

    const commonFields = (
      <>
        <Descriptions.Item label="Mã yêu cầu">{selectedRecord.id}</Descriptions.Item>
        <Descriptions.Item label="Mã khách hàng">{selectedRecord.customerId}</Descriptions.Item>
        <Descriptions.Item label="Mã dự án">{selectedRecord.projectId}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{selectedRecord.description}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái yêu cầu">{selectedRecord.requestStatus}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{selectedRecord.createdAt}</Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">{selectedRecord.updatedAt}</Descriptions.Item>
        <Descriptions.Item label="Hình ảnh đính kèm">{selectedRecord.attachments}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
          {selectedRecord.paymentStatus === "UNPAID" ? "Chưa thanh toán" :
           selectedRecord.paymentStatus === "DEPOSIT_PAID" ? "Đã cọc" :
           selectedRecord.paymentStatus === "FULLY_PAID" ? "Đã thanh toán" :
           selectedRecord.paymentStatus}
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {selectedRecord.paymentMethod === "CASH" ? "Tiền mặt" : 
           selectedRecord.paymentMethod === "BANK" ? "Ngân hàng" : 
           selectedRecord.paymentMethod}
        </Descriptions.Item>
        {selectedRecord.requestStatus === "REVIEWING" && (
          <Descriptions.Item label="Giá thỏa thuận">
            {formatCurrency(selectedRecord.agreedPrice || 0)}
          </Descriptions.Item>
        )}
        {selectedRecord.requestStatus === "REVIEWING" && (
          <Descriptions.Item label="Số tiền đặt cọc">
            {formatCurrency(selectedRecord.depositAmount || 0)}
          </Descriptions.Item>
        )}
        {selectedRecord.requestStatus === "REVIEWING" && (
          <Descriptions.Item label="Số tiền còn lại">
            {formatCurrency(selectedRecord.remainingAmount || 0)}
          </Descriptions.Item>
        )}
        {selectedRecord.requestStatus === "CANCELLED" && (
          <Descriptions.Item label="Lý do hủy">{selectedRecord.cancellationReason}</Descriptions.Item>
        )}
      </>
    );

    if (selectedRecord.requestStatus === "REVIEWING" || selectedRecord.requestStatus === "CANCELLED") {
      return (
        <Form
          form={form}
          onFinish={handleUpdateMaintenanceRequest}
          layout="vertical"
          initialValues={{
            ...selectedRecord,
            scheduledDate: selectedRecord.scheduledDate ? moment(selectedRecord.scheduledDate) : null,
          }}
        >
          <Form.Item name="id" label="Mã yêu cầu" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="customerId" label="Mã khách hàng" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="projectId" label="Mã dự án" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea disabled />
          </Form.Item>
          <Form.Item name="requestStatus" label="Trạng thái yêu cầu">
            <Input disabled />
          </Form.Item>
          <Form.Item name="maintenanceStatus" label="Trạng thái bảo trì" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="scheduledDate" label="Ngày lên lịch" hidden>
            <DatePicker disabled />
          </Form.Item>
          <Form.Item 
            name="agreedPrice" 
            label="Giá đã thỏa thuận"
            rules={[{ required: true, message: 'Vui lòng nhập giá đã thỏa thuận!' }]}
          >
            <Input
              type="number"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
          <Form.Item name="assignedTo" label="Người được giao" hidden>
            <Input/>
          </Form.Item>
          <Form.Item name="maintenanceNotes" label="Ghi chú bảo trì" hidden>
            <Input.TextArea/>
          </Form.Item>
          <Form.Item name="createdAt" label="Ngày tạo">
            <Input disabled />
          </Form.Item>
          <Form.Item name="updatedAt" label="Ngày cập nhật">
            <Input disabled />
          </Form.Item>
          <Form.Item name="attachments" label="Hình ảnh đính kèm">
            <Input disabled />
          </Form.Item>
          <Form.Item 
            name="paymentStatus" 
            label="Trạng thái thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái thanh toán!' }]}
          >
            <Select>
              <Select.Option value="UNPAID">Chưa thanh toán</Select.Option>
              <Select.Option value="DEPOSIT_PAID">Đã cọc</Select.Option>
              <Select.Option value="FULLY_PAID">Đã thanh toán</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="paymentMethod" 
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
          >
            <Select>
              <Select.Option value="CASH">Tiền mặt</Select.Option>
              <Select.Option value="BANK">Ngân hàng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="depositAmount" 
            label="Số tiền đặt cọc"
            // rules={[{ required: true, message: 'Vui lòng nhập số tiền đặt cọc!' }]}
          >
            <Input
              disabled
              type="number"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
          <Form.Item name="remainingAmount" label="Số tiền còn lại">
            <Input
              disabled
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
          {selectedRecord.requestStatus === "REVIEWING" && (
            <Button type="primary" htmlType="submit">
              Cập nhật giá thỏa thuận
            </Button>
          )}
          {selectedRecord.requestStatus === "CANCELLED" && (
            <Form.Item name="cancellationReason" label="Lý do hủy">
              <Input.TextArea disabled />
            </Form.Item>
          )}
        </Form>
      );
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => 
    request.requestStatus === "PENDING" || 
    request.requestStatus === "REVIEWING" ||
    request.requestStatus === "CANCELLED"
  );

  return (
    <div>
      <h1>Yêu cầu bảo trì</h1>
      <Select
        style={{ width: 200, marginBottom: 16 }}
        value={statusFilter}
        onChange={handleStatusFilterChange}
      >
        <Select.Option value="PENDING">Đang chờ</Select.Option>
        <Select.Option value="REVIEWING">Đang xem xét</Select.Option>
        <Select.Option value="CANCELLED">Đã hủy</Select.Option>
      </Select>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : filteredRequests.length > 0 ? (
        <Table
          columns={columns.filter(col => !col.hidden)}
          dataSource={filteredRequests}
          rowKey="id"
        />
      ) : (
        <div>Không có yêu cầu bảo trì nào cho trạng thái này</div>
      )}
      <Modal
        title="Chi tiết yêu cầu bảo trì"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderModalContent()}
      </Modal>
      <Modal
        title="Hủy yêu cầu bảo trì"
        visible={isCancelModalVisible}
        onOk={handleCancelModalOk}
        onCancel={handleCancelModalCancel}
      >
        <p>Vui lòng nhập lý do hủy yêu cầu bảo trì:</p>
        <Input.TextArea
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default MaintenanceRequest;
