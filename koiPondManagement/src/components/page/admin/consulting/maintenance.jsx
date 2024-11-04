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
  Tag,
} from "antd";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import moment from 'moment';


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
      let endpoint = `/api/maintenance-requests/${statusFilter.toLowerCase()}`;
      
      if (statusFilter === "COMPLETED") {
        endpoint = '/api/maintenance-requests/completed-unpaid';
        const response = await api.get(endpoint);
        console.log("Completed maintenance requests:", response.data);
        setMaintenanceRequests(response.data);
      } else {
        const response = await api.get(endpoint);
        setMaintenanceRequests(response.data);
      }
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
      const response = await api.patch(`/api/maintenance-requests/${selectedRecord.id}/confirm`, {
        agreedPrice: values.agreedPrice,
        requestStatus: 'CONFIRMED'
      });

      if (response.status === 200) {
        message.success("Cập nhật giá thỏa thuận thành công");
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


  const handleFinalPayment = async (record) => {
    try {
      Modal.confirm({
        title: 'Xác nhận thanh toán',
        content: (
          <div>
            <p>Xác nhận thanh toán số tiền còn lại:</p>
            <p style={{ fontWeight: 'bold' }}>{formatCurrency(record.remainingAmount)}</p>
          </div>
        ),
        onOk: async () => {
          const response = await api.post(`/api/maintenance-requests/${record.id}/final/cash`);
          if (response.status === 200) {
            message.success("Xác nhận thanh toán cuối cùng thành công");
            fetchMaintenanceRequests();
          }
        },
        okText: 'Xác nhận',
        cancelText: 'Hủy',
      });
    } catch (error) {
      console.error("Error processing final payment:", error);
      toast.error("Không thể xử lý thanh toán cuối cùng");
    }
  };

  const handleConfirmDeposit = async (record) => {
    try {
      await api.post(`/api/maintenance-requests/${record.id}/deposit/cash`);
      message.success("Xác nhận đặt cọc thành công");
      fetchMaintenanceRequests(); // Refresh lại danh sách
    } catch (error) {
      console.error("Error confirming deposit:", error);
      toast.error("Không thể xác nhận đặt cọc");
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
    { title: "Mã yêu cầu", dataIndex: "id", key: "id", hidden: true },
    { title: "Mã khách hàng", dataIndex: "customerId", key: "customerId", hidden: true },
    { title: "Mã dự án", dataIndex: "projectId", key: "projectId", hidden: true },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Trạng thái yêu cầu",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case "PENDING":
            color = 'gold';
            text = "Đang chờ";
            break;
          case "REVIEWING":
            color = 'blue';
            text = "Đang xem xét";
            break;
          case "CONFIRMED":
            color = 'green';
            text = "Đã xác nhận";
            break;
          case "COMPLETED":
            color = 'cyan';
            text = "Đã hoàn thành";
            break;
          case "CANCELLED":
            color = 'red';
            text = "Đã hủy";
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss') },
    { title: "Ngày cập nhật", dataIndex: "updatedAt", key: "updatedAt", render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss') },
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
      title: "Số tiền đặt cọc", 
      dataIndex: "depositAmount", 
      key: "depositAmount",
      render: (amount) => formatCurrency(amount),
      hidden: statusFilter !== "CONFIRMED"
    },
    { 
      title: "Số tiền còn lại", 
      dataIndex: "remainingAmount", 
      key: "remainingAmount",
      render: (amount) => formatCurrency(amount),
      hidden: statusFilter !== "COMPLETED"
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleViewMaintenanceDetails(record)}>
            Xem chi tiết
          </Button>
          {statusFilter === "COMPLETED" && record.paymentStatus !== "FULLY_PAID" && (
            <Button 
              type="primary" 
              onClick={() => handleFinalPayment(record)}
              disabled={record.remainingAmount <= 0}
            >
              Xác nhận thanh toán cuối cùng
            </Button>
          )}
          {record.requestStatus === "PENDING" && (
            <Button onClick={() => handleStartReview(record.id)}>
              Bắt đầu xem xét
            </Button>
          )}
          {record.requestStatus === "REVIEWING" && (
            <Button onClick={() => handleCancelRequest(record.id)} danger>
              Hủy yêu cầu
            </Button>
          )}
          {statusFilter === "CONFIRMED" && record.paymentStatus === "UNPAID" && (
            <Button type="primary" onClick={() => handleConfirmDeposit(record)}>
              Xác nhận đặt cọc
            </Button>
          )}
        </Space>
      ),
      hidden: statusFilter === "CANCELLED"
    },
    { 
      title: "Lý do hủy", 
      dataIndex: "cancellationReason", 
      key: "cancellationReason",
      render: (text, record) => record.requestStatus === "CANCELLED" ? text : "-",
      hidden: statusFilter !== "CANCELLED"
    },
    { 
      title: "Tên khách hàng", 
      dataIndex: "customerName", 
      key: "customerName",
      hidden: true
    },
    { 
      title: "Số điện thoại", 
      dataIndex: "customerPhone", 
      key: "customerPhone",
      hidden: true
    },
    { 
      title: "Thư điện tử", 
      dataIndex: "customerEmail", 
      key: "customerEmail",
      hidden: true
    },
    { 
      title: "Địa chỉ", 
      dataIndex: "customerAddress", 
      key: "customerAddress",
      hidden: true
    },
    { 
      title: "Tên dự án", 
      dataIndex: "projectName", 
      key: "projectName",
      hidden: true
    },
    { 
      title: "Người được giao", 
      dataIndex: "assignedToName", 
      key: "assignedToName",
      hidden: true
    },
    { 
      title: "Trạng thái bảo trì", 
      dataIndex: "maintenanceStatus", 
      key: "maintenanceStatus",
      render: (status) => {
        switch (status) {
          case "ASSIGNED":
            return "Đã phân công";
          case "IN_PROGRESS":
            return "Đang thực hiện";
          case "COMPLETED":
            return "Đã hoàn thành";
          default:
            return status;
        }
      },
      hidden: statusFilter === "CONFIRMED" || statusFilter !== "CONFIRMED"
    },
  ];

  const renderModalContent = () => {
    if (!selectedRecord) return null;

    if (statusFilter === "COMPLETED") {
      return (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên khách hàng">{selectedRecord.customerName}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{selectedRecord.customerPhone}</Descriptions.Item>
          <Descriptions.Item label="Email">{selectedRecord.customerEmail}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{selectedRecord.customerAddress}</Descriptions.Item>
          
          <Descriptions.Item label="Mô tả" span={2}>{selectedRecord.description}</Descriptions.Item>
          
          <Descriptions.Item label="Giá thỏa thuận">{formatCurrency(selectedRecord.agreedPrice)}</Descriptions.Item>
          <Descriptions.Item label="Số tiền đã cọc">{formatCurrency(selectedRecord.depositAmount)}</Descriptions.Item>
          <Descriptions.Item label="Số tiền còn lại">{formatCurrency(selectedRecord.remainingAmount)}</Descriptions.Item>
          
          <Descriptions.Item label="Ngày hoàn thành">
            {moment(selectedRecord.completionDate).format('YYYY-MM-DD')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Trạng thái thanh toán">
            {selectedRecord.paymentStatus === "UNPAID" ? "Chưa thanh toán" :
             selectedRecord.paymentStatus === "DEPOSIT_PAID" ? "Đã đặt cọc" :
             selectedRecord.paymentStatus === "FULLY_PAID" ? "Đã thanh toán đủ" :
             selectedRecord.paymentStatus}
          </Descriptions.Item>
          
          <Descriptions.Item label="Ghi chú bảo trì" span={2}>
            {selectedRecord.maintenanceNotes}
          </Descriptions.Item>
          
          {selectedRecord.maintenanceImages && selectedRecord.maintenanceImages.length > 0 && (
            <Descriptions.Item label="Hình ảnh bảo trì" span={2}>
              <Space>
                {selectedRecord.maintenanceImages.map((image, index) => (
                  <Image key={index} width={100} src={image} />
                ))}
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      );
    }

    if (statusFilter === "CONFIRMED") {
      return (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên khách hàng">{selectedRecord.customerName}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{selectedRecord.customerPhone}</Descriptions.Item>
          <Descriptions.Item label="Email">{selectedRecord.customerEmail}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{selectedRecord.customerAddress}</Descriptions.Item>
          
          <Descriptions.Item label="Mã dự án">{selectedRecord.projectId}</Descriptions.Item>
          <Descriptions.Item label="Tên dự án">{selectedRecord.projectName}</Descriptions.Item>
          
          <Descriptions.Item label="Mô tả" span={2}>{selectedRecord.description}</Descriptions.Item>
          
          <Descriptions.Item label="Trạng thái yêu cầu">
            {selectedRecord.requestStatus === "PENDING" ? "Đang chờ" :
             selectedRecord.requestStatus === "REVIEWING" ? "Đang xem xét" :
             selectedRecord.requestStatus === "CONFIRMED" ? "Đã xác nhận" :
             selectedRecord.requestStatus === "CANCELLED" ? "Đã hủy" :
             selectedRecord.requestStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái bảo trì">{selectedRecord.maintenanceStatus}</Descriptions.Item>
          
          <Descriptions.Item label="Giá thỏa thuận">{formatCurrency(selectedRecord.agreedPrice)}</Descriptions.Item>
          <Descriptions.Item label="Số tiền đặt cọc">{formatCurrency(selectedRecord.depositAmount)}</Descriptions.Item>
          <Descriptions.Item label="Số tiền còn lại">{formatCurrency(selectedRecord.remainingAmount)}</Descriptions.Item>
          
          <Descriptions.Item label="Ngày lên lịch">
            {moment(selectedRecord.scheduledDate).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">
            {moment(selectedRecord.startDate).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày hoàn thành">
            {moment(selectedRecord.completionDate).format('YYYY-MM-DD')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Tư vấn viên">{selectedRecord.consultantName}</Descriptions.Item>
          <Descriptions.Item label="Người được giao">{selectedRecord.assignedToName}</Descriptions.Item>
          
          <Descriptions.Item label="Trạng thái thanh toán">
            {selectedRecord.paymentStatus === "UNPAID" ? "Chưa thanh toán" :
             selectedRecord.paymentStatus === "DEPOSIT_PAID" ? "Đã đặt cọc" :
             selectedRecord.paymentStatus === "FULLY_PAID" ? "Đã thanh toán đủ" :
             selectedRecord.paymentStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {selectedRecord.paymentMethod === "CASH" ? "Tiền mặt" :
             selectedRecord.paymentMethod === "BANK" ? "Chuyển khoản" :
             selectedRecord.paymentMethod}
          </Descriptions.Item>
          
          <Descriptions.Item label="Ghi chú bảo trì" span={2}>
            {selectedRecord.maintenanceNotes}
          </Descriptions.Item>
          
          {selectedRecord.attachments && (
            <Descriptions.Item label="Hình ảnh đính kèm" span={2}>
              <Image width={100} src={selectedRecord.attachments} />
            </Descriptions.Item>
          )}
          
          {selectedRecord.maintenanceImages && selectedRecord.maintenanceImages.length > 0 && (
            <Descriptions.Item label="Hình ảnh bảo trì" span={2}>
              <Space>
                {selectedRecord.maintenanceImages.map((image, index) => (
                  <Image key={index} width={100} src={image} />
                ))}
              </Space>
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="Ngày tạo">
            {moment(selectedRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {moment(selectedRecord.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      );
    }

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
          }}
        >
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea disabled />
          </Form.Item>
          <Form.Item name="requestStatus" label="Trạng thái yêu cầu">
            <Input disabled />
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
          <Button type="primary" htmlType="submit">
            Cập nhật giá thỏa thuận
          </Button>
        </Form>
      );
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    if (statusFilter === "COMPLETED") {
      return request.maintenanceStatus === "COMPLETED" && 
             request.paymentStatus !== "FULLY_PAID";
    }
    if (statusFilter === "PENDING") return request.requestStatus === "PENDING";
    if (statusFilter === "REVIEWING") return request.requestStatus === "REVIEWING";
    if (statusFilter === "CANCELLED") return request.requestStatus === "CANCELLED";
    if (statusFilter === "CONFIRMED") return request.requestStatus === "CONFIRMED";
    if (statusFilter === "COMPLETED") return request.requestStatus === "COMPLETED"; 
    return false;
  });

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
        <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
        <Select.Option value="COMPLETED">Hoàn thành - chờ thanh toán </Select.Option>
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderModalContent()}
      </Modal>
      <Modal
        title="Hủy yêu cầu bảo trì"
        open={isCancelModalVisible}
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
