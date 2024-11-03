import { useState, useEffect } from "react";
import {
  Table,
  message,
  Modal,
  Button,
  Select,
  Input,
  Form,
  DatePicker,
  InputNumber,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import moment from "moment";

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

  const paymentStatusOptions = [
    { value: 'UNPAID', label: 'Chưa thanh toán' },
    { value: 'DEPOSIT_PAID', label: 'Đã cọc' },
    { value: 'FULLY_PAID', label: 'Đã thanh toán' }
  ];

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchStaffList();
  }, [requestStatus]);

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
      message.error(`Không thể tải ${requestStatus.toLowerCase()} yêu cầu.`);
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
      message.error("Không thể tải danh sách nhân viên.");
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
      message.success("Yêu cầu bảo trì đã hủy thành công.");
      setCancelModalVisible(false);
      setCancelReason("");
      fetchMaintenanceRequests();
    } catch (error) {
      message.error("Không thể hủy yêu cầu.");
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
      message.success("Phân công nhân viên thành công.");
      setIsAssignModalVisible(false);
      fetchMaintenanceRequests();
    } catch (error) {
      message.error("Không thể phân công nhân viên.");
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

    // Sắp xếp theo ngày hoàn thành mới nhất cho trạng thái COMPLETED
    if (requestStatus === "COMPLETED") {
      filteredData.sort((a, b) => {
        const dateA = new Date(a.completionDate);
        const dateB = new Date(b.completionDate);
        return dateB - dateA; 
      });
    }

    return filteredData;
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", hidden: true },
    { title: "Khách hàng", dataIndex: "customerId", key: "customerId" },
    { title: "Dự án", dataIndex: "projectId", key: "projectId" },
    { title: "Tư vấn viên", dataIndex: "consultantId", key: "consultantId" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Trạng thái yêu cầu", dataIndex: "requestStatus", key: "requestStatus", hidden: requestStatus === "COMPLETED" },
    { 
      title: "Trạng thái bảo trì", 
      dataIndex: "maintenanceStatus", 
      key: "maintenanceStatus", 
      hidden: requestStatus === "CONFIRMED" || requestStatus === "CANCELLED"
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => moment(date).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Ngày lên lịch",
      dataIndex: "scheduleDate",
      key: "scheduleDate",
      hidden: true,
      render: (date) => moment(date).format("DD-MM-YYYY") || "N/A",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      hidden: true,
      render: (date) => moment(date).format("DD-MM-YYYY") || "N/A",
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "completionDate",
      key: "completionDate",
      hidden: requestStatus === "CONFIRMED",
      render: (date) => date ? moment(date).format("DD-MM-YYYY") : "N/A"
    },
    { 
      title: "Trạng thái thanh toán", 
      dataIndex: "paymentStatus", 
      key: "paymentStatus",
      render: (status) => {
        const statusMap = {
          UNPAID: 'Chưa thanh toán',
          DEPOSIT_PAID: 'Đã cọc',
          FULLY_PAID: 'Đã thanh toán'
        };
        return statusMap[status] || status;
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
      render: (amount) => new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    },
    { 
      title: "Số tiền còn lại", 
      dataIndex: "remainingAmount", 
      key: "remainingAmount",
      render: (amount) => new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    },
    { 
      title: "Giá thỏa thuận", 
      dataIndex: "agreedPrice", 
      key: "agreedPrice",
      render: (price) => new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price || 0)
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
          {requestStatus === "CONFIRMED" && (
            <>
              <Button onClick={() => handleAssign(record)} style={{ marginRight: 8 }}>
                Phân công nhân viên
              </Button>
              <Button onClick={() => handleCancel(record)}>Hủy yêu cầu</Button>
            </>
          )}
          {requestStatus === "CANCELLED" && (
            <Button icon={<EyeOutlined />} onClick={() => handleViewCancelReason(record)}>
              Xem lý do hủy
            </Button>
          )}
        </>
      ),
      hidden: requestStatus === "COMPLETED",
    },
  ];

  return (
    <div>
      <h1>Yêu cầu bảo trì</h1>
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
        visible={viewCancelReasonModalVisible}
        onOk={() => setViewCancelReasonModalVisible(false)}
        onCancel={() => setViewCancelReasonModalVisible(false)}
      >
        <p>{currentCancelReason}</p>
      </Modal>

      {/* Cancel Request Modal */}
      <Modal
        title="Hủy yêu cầu"
        visible={cancelModalVisible}
        onOk={submitCancel}
        onCancel={() => setCancelModalVisible(false)}
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
        title="Phân công nhân viên"
        visible={isAssignModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => setIsAssignModalVisible(false)}
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn nhân viên"
          onChange={(value) => setSelectedStaffId(value)}
        >
          {staffList.map((staff) => (
            <Option key={staff.id} value={staff.id}>
              {staff.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default ManageMaintenance;
