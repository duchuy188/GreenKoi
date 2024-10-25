import { useState, useEffect } from "react";
import {
  Table,
  message,
  Modal,
  Button,
  Select,
  Input,
} from "antd";
import { EyeOutlined } from '@ant-design/icons';
import api from "../../../config/axios";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

const ManageMaintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState('CONFIRMED');
  const [viewCancelReasonModalVisible, setViewCancelReasonModalVisible] = useState(false);
  const [currentCancelReason, setCurrentCancelReason] = useState('');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [requestStatus]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/maintenance-requests/confirmed';
      if (requestStatus === 'CANCELLED') {
        endpoint = '/api/maintenance-requests/cancelled';
      }
      const response = await api.get(endpoint);
      console.log(`Fetched ${requestStatus.toLowerCase()} maintenance requests:`, response.data);
      setMaintenanceRequests(response.data);
    } catch (error) {
      console.error(`Error fetching ${requestStatus.toLowerCase()} maintenance requests:`, error);
      message.error(`Failed to load ${requestStatus.toLowerCase()} maintenance requests`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCancelReason = (record) => {
    if (record.cancellationReason) {
      setCurrentCancelReason(record.cancellationReason);
    } else {
      setCurrentCancelReason("No cancellation reason provided.");
    }
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
      message.success('Maintenance request cancelled successfully');
      setCancelModalVisible(false);
      setCancelReason('');
      setSelectedRequest(null);
      fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error cancelling maintenance request:', error);
      message.error('Failed to cancel maintenance request');
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
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
      render: (date) => {
        if (!date) return "N/A";
        const formattedDate = moment(date).format("YYYY-MM-DD");
        return moment(date).isValid() ? formattedDate : "N/A";
      },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => {
        if (!date) return "N/A";
        return moment(date).isValid() ? moment(date).format("YYYY-MM-DD") : "N/A";
      },
    },
    {
      title: "Completion Date",
      dataIndex: "completionDate",
      key: "completionDate",
      render: (date) => {
        if (!date) return "N/A";
        return moment(date).isValid() ? moment(date).format("YYYY-MM-DD") : "N/A";
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          {requestStatus === 'CONFIRMED' && (
            <>
              <Button onClick={() => handleAssign(record)}>Assign Staff</Button>
              <Button onClick={() => handleCancel(record)} style={{ marginLeft: '10px' }}>Cancel</Button>
            </>
          )}
          {requestStatus === 'CANCELLED' && (
              <Button 
                icon={<EyeOutlined />} 
                onClick={() => handleViewCancelReason(record)}
              >
                Xem lý do hủy
              </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Maintenance Requests</h1>
      <Select
        style={{ width: 200, marginBottom: 16 }}
        value={requestStatus}
        onChange={(value) => setRequestStatus(value)}
      >
        <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
        <Select.Option value="CANCELLED">Đã hủy</Select.Option>
      </Select>
      <Table
        columns={columns}
        dataSource={maintenanceRequests}
        loading={loading}
        rowKey="id"
      />
      
      {/* View Cancel Reason Modal */}
      <Modal
        title="Cancellation Reason"
        visible={viewCancelReasonModalVisible}
        onOk={() => setViewCancelReasonModalVisible(false)}
        onCancel={() => setViewCancelReasonModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewCancelReasonModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <p>{currentCancelReason}</p>
      </Modal>
      
      {/* Cancel Modal */}
      <Modal
        title="Hủy yêu cầu bảo trì"
        visible={cancelModalVisible}
        onOk={submitCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
          setSelectedRequest(null);
        }}
      >
        <p>Bạn có chắc chắn muốn hủy yêu cầu bảo trì này không?</p>
        <TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Vui lòng nhập lý do hủy yêu cầu bảo trì"
        />
      </Modal>
    </div>
  );
};

export default ManageMaintenance;
