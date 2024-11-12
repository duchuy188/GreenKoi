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
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount).replace('₫', 'VNĐ');
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
  const [searchText, setSearchText] = useState('');
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

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
        const sortedData = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMaintenanceRequests(sortedData);
      } else {
        const response = await api.get(endpoint);
        const sortedData = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMaintenanceRequests(sortedData);
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
        toast.success("Bắt đầu xem xét yêu cầu bảo trì thành công");
        fetchMaintenanceRequests(); 
      }
    } catch (error) {
      console.error("Error starting review:", error);
      toast.error("Không thể bt đu xem xét yêu cầu bảo trì");
    }
  };

  const handleUpdateMaintenanceRequest = async (values) => {
    try {
      const response = await api.patch(`/api/maintenance-requests/${selectedRecord.id}/confirm`, {
        agreedPrice: values.agreedPrice,
        requestStatus: 'CONFIRMED'
      });

      if (response.status === 200) {
        toast.success("Cập nhật giá thỏa thuận thành công");
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
        toast.error("Vui lòng nhập lý do hủy yêu cầu");
        return;
      }

      const response = await api.patch(`/api/maintenance-requests/${cancellingRequestId}/cancel`, {
        cancellationReason: cancellationReason
      });

      if (response.status === 200) {
        toast.success("Yêu cầu bảo trì đã được hủy thành công");
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
            toast.success("Xác nhận thanh toán cuối cùng thành công");
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
      toast.success("Xác nhận đặt cọc thành công");
      fetchMaintenanceRequests(); 
    } catch (error) {
      console.error("Error confirming deposit:", error);
      toast.error("Không thể xác nhận đặt cọc");
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleViewAttachments = (attachments) => {
    if (!attachments) return;
    const imageList = attachments.split(',').filter(url => url.trim());
    setPreviewImages(imageList);
    setIsImagePreviewVisible(true);
  };

  const handleViewDescription = (description) => {
    setSelectedDescription(description);
    setIsDescriptionModalVisible(true);
  };

  const columns = [
    {
      title: "Hình Ảnh Đính Kèm",
      dataIndex: "attachments",
      key: "attachments",
      render: (attachments) => (
        attachments ? (
          <Button 
            type="link" 
            onClick={() => handleViewAttachments(attachments)}
          >
            Xem {attachments.split(',').filter(url => url.trim()).length} hình ảnh
          </Button>
        ) : null
      ),
    },
    { 
      title: "Tên khách hàng", 
      dataIndex: "customerName", 
      key: "customerName",
    },
    { title: "Mã yêu cầu", dataIndex: "id", key: "id", hidden: true },
    { title: "Mã khách hàng", dataIndex: "customerId", key: "customerId", hidden: true },
    { title: "Mã dự án", dataIndex: "projectId", key: "projectId", hidden: true },
    { 
      title: "Mô tả", 
      dataIndex: "description", 
      key: "description",
      render: (text) => (
        <EyeOutlined 
          style={{ cursor: 'pointer', color: 'black' }}
          onClick={() => handleViewDescription(text)}
        />
      )
    },
    {
      title: "Trạng thái yêu cầu",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case "PENDING":
            color = 'orange';
            text = "Đang chờ";
            break;
          case "REVIEWING":
            color = 'geekblue';
            text = "Đang xem xét";
            break;
          case "CONFIRMED":
            color = 'green';
            text = "Đã xác nhận";
            break;
          case "COMPLETED":
            color = 'purple';
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
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss') },
    { title: "Ngày cập nhật", dataIndex: "updatedAt", key: "updatedAt", render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss') },
    { 
      title: "Trạng thái thanh toán", 
      dataIndex: "paymentStatus", 
      key: "paymentStatus",
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case "UNPAID":
            color = 'red';
            text = "Chưa thanh toán";
            break;
          case "DEPOSIT_PAID":
            color = 'orange';
            text = "Đã cọc";
            break;
          case "FULLY_PAID":
            color = 'green';
            text = "Đã thanh toán";
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
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
          {statusFilter !== "PENDING" && (
            <Button onClick={() => handleViewMaintenanceDetails(record)}>
              Xem chi tiết
            </Button>
          )}
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
            {moment(selectedRecord.completionDate).format('DD/MM/YYYY')}
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
          <Descriptions.Item label="Tn dự án">{selectedRecord.projectName}</Descriptions.Item>
          
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
            {selectedRecord.scheduledDate ? moment(selectedRecord.scheduledDate).format('DD/MM/YYYY') : 'Chưa có ngày'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">
            {selectedRecord.startDate ? moment(selectedRecord.startDate).format('DD/MM/YYYY') : 'Chưa có ngày'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày hoàn thành">
            {selectedRecord.completionDate ? moment(selectedRecord.completionDate).format('DD/MM/YYYY') : 'Chưa có ngày'}
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
            {moment(selectedRecord.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {moment(selectedRecord.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
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
        <div>
          <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Tên khách hàng">{selectedRecord.customerName}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedRecord.customerPhone}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedRecord.customerEmail}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{selectedRecord.customerAddress}</Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>{selectedRecord.description}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái yêu cầu">
              {selectedRecord.requestStatus === "REVIEWING" ? "Đang xem xét" : "Đã hủy"}
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={form}
            onFinish={handleUpdateMaintenanceRequest}
            layout="vertical"
            initialValues={{
              ...selectedRecord,
            }}
          >
            <Form.Item 
              name="agreedPrice" 
              label="Giá đã thỏa thuận"
              rules={[
                { required: true, message: 'Vui lòng nhập giá đã thỏa thuận!' },
                {//nhập giá thoả thuận 
                  validator: (_, value) => {
                    const numValue = Number(value?.toString().replace(/\D/g, ''));
                    if (numValue <= 100000) {
                      return Promise.reject('Nhập số tiền đã thoả thuận.');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                type="text"
                style={{ width: '100%' }}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                  form.setFieldsValue({ agreedPrice: formattedValue });
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  form.setFieldsValue({ agreedPrice: Number(value) });
                }}
                suffix="VNĐ"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật giá thỏa thuận
            </Button>
          </Form>
        </div>
      );
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesStatus = (() => {
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
    })();

    const matchesSearch = request.customerName?.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && (searchText ? matchesSearch : true);
  });

  return (
    <div>
      <h1>Yêu cầu bảo trì</h1>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <Select.Option value="PENDING">Đang chờ</Select.Option>
            <Select.Option value="REVIEWING">Đang xem xét</Select.Option>
            <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
            <Select.Option value="COMPLETED">Hoàn thành - chờ thanh toán </Select.Option>
            <Select.Option value="CANCELLED">Đã hủy</Select.Option>
          </Select>
        </Col>
        <Col>
          <Input
            placeholder="Tìm kiếm theo tên khách hàng"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
          />
        </Col>
      </Row>
      
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
      <Modal
        title="Hình Ảnh Đính Kèm"
        open={isImagePreviewVisible}
        onCancel={() => setIsImagePreviewVisible(false)}
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
              src={imageUrl}
              alt={`Image ${index + 1}`}
              style={{ width: '100%', height: 'auto' }}
            />
          ))}
        </div>
      </Modal>
      <Modal
        title="Chi tiết mô tả"
        open={isDescriptionModalVisible}
        onCancel={() => setIsDescriptionModalVisible(false)}
        footer={null}
        width={800}
      >
        <p>{selectedDescription}</p>
      </Modal>
    </div>
  );
};
  
export default MaintenanceRequest;
