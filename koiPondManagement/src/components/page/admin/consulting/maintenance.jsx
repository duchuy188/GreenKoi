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
        fetchMaintenanceRequests(); // Refresh the list
      }
    } catch (error) {
      console.error("Error starting review:", error);
      toast.error("Không thể bắt đầu xem xét yêu cầu bảo trì");
    }
  };

  const handleUpdateMaintenanceRequest = async (values) => {
    try {
      const response = await api.patch(`/api/maintenance-requests/${selectedRecord.id}/confirm`, {
        agreedPrice: values.agreedPrice,
        requestStatus: 'CONFIRMED'  // Add this line to update the status
      });
      if (response.status === 200) {
        message.success("Cập nhật giá đã thỏa thuận thành công");
        setIsModalVisible(false);
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast.error("Không thể cập nhật giá đã thỏa thuận");
    }
  };

  const handleCancelRequest = (id) => {
    setCancellingRequestId(id);
    setIsCancelModalVisible(true);
  };

  const handleCancelModalOk = async () => {
    try {
      const response = await api.patch(`/api/maintenance-requests/${cancellingRequestId}/cancel`, {
        cancellationReason: cancellationReason,
        requestStatus: 'CANCELLED'  // Add this line to update the status
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleViewMaintenanceDetails(record)}>
            View Details
          </Button>
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
        </Space>
      ),
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
        <Descriptions.Item label="ID">{selectedRecord.id}</Descriptions.Item>
        <Descriptions.Item label="Customer ID">{selectedRecord.customerId}</Descriptions.Item>
        <Descriptions.Item label="Project ID">{selectedRecord.projectId}</Descriptions.Item>
        <Descriptions.Item label="Description">{selectedRecord.description}</Descriptions.Item>
        <Descriptions.Item label="Request Status">{selectedRecord.requestStatus}</Descriptions.Item>
        <Descriptions.Item label="Created At">{selectedRecord.createdAt}</Descriptions.Item>
        <Descriptions.Item label="Updated At">{selectedRecord.updatedAt}</Descriptions.Item>
        <Descriptions.Item label="Attachments">{selectedRecord.attachments}</Descriptions.Item>
        {selectedRecord.requestStatus === "CANCELLED" && (
          <Descriptions.Item label="Cancellation Reason">{selectedRecord.cancellationReason}</Descriptions.Item>
        )}
      </>
    );

    if (selectedRecord.requestStatus === "PENDING") {
      return (
        <Descriptions column={1} bordered>
          {commonFields}
        </Descriptions>
      );
    } else if (selectedRecord.requestStatus === "REVIEWING" || selectedRecord.requestStatus === "CANCELLED") {
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
          <Form.Item name="id" label="ID" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="customerId" label="Customer ID" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="projectId" label="Project ID" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea disabled />
          </Form.Item>
          <Form.Item name="requestStatus" label="Request Status">
            <Input disabled />
          </Form.Item>
          <Form.Item name="maintenanceStatus" label="Maintenance Status" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item name="scheduledDate" label="Scheduled Date" hidden>
            <DatePicker disabled />
          </Form.Item>
          <Form.Item 
            name="agreedPrice" 
            label="Agreed Price"
            rules={[{ required: true, message: 'Please input the agreed price!' }]}
          >
            <Input type="number" disabled={selectedRecord.requestStatus !== "REVIEWING"} />
          </Form.Item>
          <Form.Item name="assignedTo" label="Assigned To" hidden>
            <Input/>
          </Form.Item>
          <Form.Item name="maintenanceNotes" label="Maintenance Notes" hidden>
            <Input.TextArea/>
          </Form.Item>
          <Form.Item name="createdAt" label="Created At">
            <Input disabled />
          </Form.Item>
          <Form.Item name="updatedAt" label="Updated At">
            <Input disabled />
          </Form.Item>
          <Form.Item name="attachments" label="Attachments">
            <Input disabled />
          </Form.Item>
          {selectedRecord.requestStatus === "REVIEWING" && (
            <Button type="primary" htmlType="submit">
              Update Agreed Price
            </Button>
          )}
          {selectedRecord.requestStatus === "CANCELLED" && (
            <Form.Item name="cancellationReason" label="Cancellation Reason">
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
