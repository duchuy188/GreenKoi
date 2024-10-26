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
  const [form] = Form.useForm();
  const [editingRequest, setEditingRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  // Fetch maintenance requests and staff list on mount and whenever request status changes.
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
      }
      const response = await api.get(endpoint);
      setMaintenanceRequests(response.data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
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
      console.error("Error fetching staff list:", error);
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
      console.error("Error cancelling maintenance request:", error);
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
      console.error("Error assigning maintenance staff:", error);
      message.error("Không thể phân công nhân viên.");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", hidden: true },
    { title: "Customer ID", dataIndex: "customerId", key: "customerId" },
    { title: "Project ID", dataIndex: "projectId", key: "projectId" },
    { title: "Consultant ID", dataIndex: "consultantId", key: "consultantId" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Request Status", dataIndex: "requestStatus", key: "requestStatus" },
    { title: "Maintenance Status", dataIndex: "maintenanceStatus", key: "maintenanceStatus" },
    {
      title: "Schedule Date",
      dataIndex: "scheduleDate",
      key: "scheduleDate",
      hidden: true,
      render: (date) => moment(date).format("YYYY-MM-DD") || "N/A",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      hidden: true,
      render: (date) => moment(date).format("YYYY-MM-DD") || "N/A",
    },
    {
      title: "Completion Date",
      dataIndex: "completionDate",
      key: "completionDate",
      hidden: true,
      render: (date) => moment(date).format("YYYY-MM-DD") || "N/A",
    },
    {
      title: "Actions",
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
    },
  ];

  return (
    <div>
      <h1>Yêu cầu bảo trì</h1>
      <Select
        style={{ width: 200, marginBottom: 16 }}
        value={requestStatus}
        onChange={(value) => setRequestStatus(value)}
      >
        <Option value="CONFIRMED">Đã xác nhận</Option>
        <Option value="CANCELLED">Đã hủy</Option>
      </Select>
      <Table
        columns={columns}
        dataSource={maintenanceRequests}
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
