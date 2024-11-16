import { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Button,
  Select,
  Input,
  Typography,
  Empty,
  Tag,
} from "antd";
import { EyeOutlined, StarFilled } from "@ant-design/icons";
import api from "../../../config/axios";
import moment from "moment";
import { toast } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;

const ManageMaintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState("CONFIRMED");
  const [viewCancelReasonModalVisible, setViewCancelReasonModalVisible] =
    useState(false);
  const [currentCancelReason, setCurrentCancelReason] = useState("");
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchStaff, setSearchStaff] = useState("");
  const [assignedStaffIds, setAssignedStaffIds] = useState([]);

  const paymentStatusOptions = [
    { value: 'UNPAID', label: 'Chưa thanh toán' },
    { value: 'DEPOSIT_PAID', label: 'Đã cọc' },
    { value: 'FULLY_PAID', label: 'Đã thanh toán' }
  ];

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchStaffList();
  }, [requestStatus]);

  useEffect(() => {
    const assignedIds = maintenanceRequests
      .filter(request => request.requestStatus === "CONFIRMED" && request.assignedTo)
      .map(request => request.assignedTo);
    setAssignedStaffIds([...new Set(assignedIds)]);
  }, [maintenanceRequests]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      let endpoint = "/api/maintenance-requests/confirmed";
      if (requestStatus === "CANCELLED") {
        endpoint = "/api/maintenance-requests/cancelled";
      } else if (requestStatus === "COMPLETED") {
        endpoint = "/api/maintenance-requests/completed";
      }
      const response = await api.get(endpoint);
      
      const formattedData = response.data.map(request => ({
        ...request,
        paymentStatus: request.paymentStatus || "UNPAID",
        paymentMethod: request.paymentMethod || "CASH",
        depositAmount: request.depositAmount || 0,
        remainingAmount: request.remainingAmount || 0,
        agreedPrice: request.agreedPrice || 0
      }));
      
      setMaintenanceRequests(formattedData);
    } catch (error) {
      toast.error(`Không thể tải ${requestStatus.toLowerCase()} yêu cầu.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await api.get("/api/manager/users");
      const maintenanceStaff = response.data.filter(
        (user) => user.roleId === "4"
      );
      setStaffList(
        maintenanceStaff.map((user) => ({
          id: user.id,
          name: user.fullName || user.username,
        }))
      );
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên.");
    }
  };

  const handleViewCancelReason = (record) => {
    setCurrentCancelReason(
      record.cancellationReason || "No cancellation reason provided."
    );
    setViewCancelReasonModalVisible(true);
  };

  const handleCancel = (record) => {
    setSelectedRequest(record);
    setCancelModalVisible(true);
  };

  const submitCancel = async () => {
    try {
      await api.patch(`/api/maintenance-requests/${selectedRequest.id}/cancel`, {
        cancellationReason: cancelReason,
      });
      toast.success("Yêu cầu bảo trì đã hủy thành công.");
      setCancelModalVisible(false);
      setCancelReason("");
      fetchMaintenanceRequests();
    } catch (error) {
      toast.error("Không thể hủy yêu cầu.");
    }
  };

  const handleAssign = (record) => {
    setEditingRequest(record);
    setIsAssignModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    try {
      await api.patch(`/api/maintenance-requests/${editingRequest.id}/assign`, {
        staffId: selectedStaffId,
      });
      toast.success("Phân công nhân viên thành công.");
      setIsAssignModalVisible(false);
      fetchMaintenanceRequests();
    } catch (error) {
      toast.error("Nhân viên này đã được phân công cho yêu cầu khác.");
    }
  };

  const getFilteredData = () => {
    let filteredData = maintenanceRequests.filter(request => {
      let matchesStaffFilter = true;

      if (selectedStaffFilter && requestStatus === "COMPLETED") {
        matchesStaffFilter = request.assignedTo === selectedStaffFilter;
      }

      return matchesStaffFilter;
    });

    // Sắp xếp tất cả các yêu cầu theo thời gian tạo mới nhất
    filteredData.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    return filteredData;
  };

  const handleViewReview = async (record) => {
    try {
      const response = await api.get(`/api/maintenance-requests/${record.id}/review`);
      setCurrentReview(response.data);
      setReviewModalVisible(true);
    } catch (error) {
      toast.error("Chưa có đánh giá nào cho yêu cầu này.");
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailsModalVisible(true);
  };

  const getAvailableStaff = () => {
    return staffList.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchStaff.toLowerCase());
      const isAvailable = !assignedStaffIds.includes(staff.id);
      return matchesSearch && isAvailable;
    });
  };

  const columns = [
    { title: "Dự án", dataIndex: "projectName", key: "projectName", render: (text) => text || "N/A" },
    { title: "Nhân viên tư vấn", dataIndex: "consultantName", key: "consultantName", render: (text) => text || "N/A" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Trạng thái yêu cầu",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: (status) => {
        const statusConfig = {
          PENDING: { color: '#f6ffed', text: 'Chờ xác nhận', textColor: '#52c41a' },
          CONFIRMED: { color: '#e6f7ff', text: 'Đã xác nhận', textColor: '#1890ff' },
          CANCELLED: { color: '#fff2f0', text: 'Đã hủy', textColor: '#ff4d4f' },
          COMPLETED: { color: '#f6ffed', text: 'Hoàn thành', textColor: '#52c41a' }
        };

        return (
          <Tag
            color={statusConfig[status]?.color}
            style={{ 
              color: statusConfig[status]?.textColor,
              borderColor: statusConfig[status]?.textColor,
            }}
          >
            {statusConfig[status]?.text || status}
          </Tag>
        );
      }
    },
    { 
      title: "Trạng thái thanh toán", 
      dataIndex: "paymentStatus", 
      key: "paymentStatus",
      render: (status) => {
        const statusConfig = {
          UNPAID: { color: '#fff2f0', text: 'Chưa thanh toán', textColor: '#ff4d4f' },
          DEPOSIT_PAID: { color: '#fff7e6', text: 'Đã cọc', textColor: '#faad14' },
          FULLY_PAID: { color: '#f6ffed', text: 'Đã thanh toán', textColor: '#52c41a' }
        };

        return (
          <Tag
            color={statusConfig[status]?.color}
            style={{ 
              color: statusConfig[status]?.textColor,
              borderColor: statusConfig[status]?.textColor,
            }}
          >
            {statusConfig[status]?.text || status}
          </Tag>
        );
      }
    },
    { 
      title: "Phương thức thanh toán", 
      dataIndex: "paymentMethod", 
      key: "paymentMethod",
      render: (method) => {
        const methods = {
          CASH: "Tiền mặt",
          BANK_TRANSFER: "Chuyển khoản",
        };
        return methods[method] || method;
      }
    },
    { 
      title: "Tiền đặt cọc", 
      dataIndex: "depositAmount", 
      key: "depositAmount",
      render: (amount) => `${amount?.toLocaleString() || 0} VNĐ`
    },
    { 
      title: "Số tiền còn lại", 
      dataIndex: "remainingAmount", 
      key: "remainingAmount",
      render: (amount) => `${amount?.toLocaleString() || 0} VNĐ`
    },
    { 
      title: "Giá thỏa thuận", 
      dataIndex: "agreedPrice", 
      key: "agreedPrice",
      render: (price) => `${price?.toLocaleString() || 0} VNĐ`
    },
    { 
      title: "Nhân viên được giao", 
      dataIndex: "assignedTo", 
      key: "assignedTo",
      hidden: requestStatus === "CONFIRMED" || requestStatus === "CANCELLED",
      render: (staffId) => {
        const assignedStaff = staffList.find(staff => staff.id === staffId);
        return assignedStaff ? assignedStaff.name : 'Chưa phân công';
      }
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Button 
            onClick={() => handleViewDetails(record)} 
            icon={<EyeOutlined />} 
            style={{ marginRight: 8, color: '#1890ff', borderColor: '#1890ff' }}
          >
            Xem chi tiết
          </Button>
          {requestStatus === "CONFIRMED" && (
            <>
              {record.paymentStatus === "DEPOSIT_PAID" && (
                <Button 
                  onClick={() => handleAssign(record)} 
                  style={{ marginRight: 8 }}
                  type="primary"
                >
                  Phân công nhân viên
                </Button>
              )}
              <Button 
                onClick={() => handleCancel(record)}
                danger
              >
                Hủy yêu cầu
              </Button>
            </>
          )}
          {requestStatus === "CANCELLED" && (
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewCancelReason(record)}
              style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}
            >
              Xem lý do hủy
            </Button>
          )}
          {requestStatus === "COMPLETED" && (
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewReview(record)}
              style={{ color: '#52c41a', borderColor: '#52c41a' }}
            >
              Xem đánh giá
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản lí bảo trì</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          style={{ width: 200 }}
          value={requestStatus}
          onChange={(value) => {
            setRequestStatus(value);
          }}
        >
          <Option value="CONFIRMED">Đã xác nhận</Option>
          <Option value="CANCELLED">Đã hủy</Option>
          <Option value="COMPLETED">Đã hoàn thành</Option>
        </Select>

        {requestStatus === "COMPLETED" && (
          <Select
            style={{ width: 200 }}
            placeholder="Lọc theo nhân viên"
            allowClear
            onChange={(value) => setSelectedStaffFilter(value)}
          >
            {staffList.map((staff) => (
              <Option key={staff.id} value={staff.id}>
                {staff.name}
              </Option>
            ))}
          </Select>
        )}
      </div>

      <Table
        columns={columns.filter(column => !column.hidden)}
        dataSource={getFilteredData()}
        loading={loading}
        rowKey="id"
      />

      {/* View Cancel Reason Modal */}
      <Modal
        title="Lý do hủy"
        open={viewCancelReasonModalVisible}
        onOk={() => setViewCancelReasonModalVisible(false)}
        onCancel={() => setViewCancelReasonModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewCancelReasonModalVisible(false)} type="primary">
            Đóng
          </Button> 
        ]}
      >
        <p>{currentCancelReason}</p>
      </Modal>

      {/* Cancel Request Modal */}
      <Modal
        title="Hủy yêu cầu"
        open={cancelModalVisible}
        onOk={submitCancel}
        onCancel={() => setCancelModalVisible(false)}
        okText="Hủy yêu cầu"
        cancelText="Hủy"
      >
        <TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Nhập lý do hủy"
        />
      </Modal>

      {/* Assign Staff Modal */}
      <Modal
        title={<div className="assign-modal-title">Phân công nhân viên</div>}
        open={isAssignModalVisible}
        onCancel={() => {
          setIsAssignModalVisible(false);
          setSelectedStaffId(null);
          setSearchStaff("");
        }}
        onOk={handleAssignSubmit}
        okText="Xác nhận phân công"
        cancelText="Hủy"
        width={500}
      >
        <Input.Search
          placeholder="Tìm kiếm nhân viên..."
          value={searchStaff}
          onChange={(e) => setSearchStaff(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {getAvailableStaff().length > 0 ? (
            getAvailableStaff().map((staff) => (
              <div
                key={staff.id}
                className={`constructor-item ${
                  selectedStaffId === staff.id ? "selected" : ""
                }`}
                onClick={() => setSelectedStaffId(staff.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedStaffId === staff.id ? "#e6f7ff" : "transparent",
                  borderRadius: '4px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                  }}
                >
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Typography.Text strong>{staff.name}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    Chưa có dự án nào
                  </Typography.Text>
                </div>
                {selectedStaffId === staff.id && (
                  <Tag color="blue" style={{ marginLeft: 'auto' }}>Đã chọn</Tag>
                )}
              </div>
            ))
          ) : (
            <Empty description="Không tìm thấy nhân viên phù hợp" />
          )}
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Đánh giá của khách hàng"
        open={reviewModalVisible}
        onOk={() => setReviewModalVisible(false)}
        onCancel={() => setReviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReviewModalVisible(false)} type="primary">
            Đóng
          </Button>
        ]}
      >
        {currentReview ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>Đánh giá:</span>
              {[...Array(currentReview.rating)].map((_, index) => (
                <StarFilled key={index} style={{ color: '#fadb14' }} />
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>Nhận xét:</span>
              <p>{currentReview.comment || "Không có nhận xét"}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>Ngày đánh giá:</span>
              <p>{moment(currentReview.reviewDate).format("DD-MM-YYYY HH:mm:ss")}</p>
            </div>
            <div>
              <span style={{ marginRight: 8 }}>Trạng thái:</span>
              <p>{currentReview.status === 'SUBMITTED' ? 'Đã gửi' : currentReview.status || "Không có trạng thái"}</p>
            </div>
          </div>
        ) : (
          <p>Chưa có đánh giá</p>
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Chi tiết yêu cầu bảo trì"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)} type="primary">
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p><strong>Tên khách hàng:</strong> {selectedRecord.customerName || 'N/A'}</p>
              <p><strong>Số điện thoại:</strong> {selectedRecord.customerPhone || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedRecord.customerEmail || 'N/A'}</p>
              <p><strong>Địa chỉ:</strong> {selectedRecord.customerAddress || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Ngày tạo:</strong> {moment(selectedRecord.createdAt).format("DD-MM-YYYY HH:mm:ss")}</p>
              <p><strong>Ngày cập nhật:</strong> {moment(selectedRecord.updatedAt).format("DD-MM-YYYY HH:mm:ss")}</p>
              {requestStatus === "COMPLETED" && (
                <p><strong>Ngày hoàn thành:</strong> {selectedRecord.completionDate ? moment(selectedRecord.completionDate).format("DD-MM-YYYY") : 'N/A'}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageMaintenance;
