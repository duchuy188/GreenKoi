import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Descriptions,
  Image,
  message,
} from "antd";
import api from "../../../config/axios";
import { toast } from "react-toastify";

const MaintenanceRequest = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); // Store the selected record for details modal

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/maintenance-requests/pending");
      setMaintenanceRequests(response.data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      toast.error("Không thể tải danh sách yêu cầu bảo trì");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaintenanceDetails = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Customer ID", dataIndex: "customerId", key: "customerId" },
    { title: "Project ID", dataIndex: "projectId", key: "projectId" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Request Status", dataIndex: "requestStatus", key: "requestStatus" },
    { title: "Maintenance Status", dataIndex: "maintenanceStatus", key: "maintenanceStatus" },
    { title: "Scheduled Date", dataIndex: "scheduledDate", key: "scheduledDate" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleViewMaintenanceDetails(record)}>
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Yêu cầu bảo trì</h1>
      <Table
        columns={columns}
        dataSource={maintenanceRequests}
        loading={loading}
        rowKey="id"
        locale={{ emptyText: "Không có yêu cầu bảo trì nào" }}
      />
      <Modal
        title="Chi tiết yêu cầu bảo trì"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedRecord.id}</Descriptions.Item>
            <Descriptions.Item label="Customer ID">{selectedRecord.customerId}</Descriptions.Item>
            <Descriptions.Item label="Consultant ID">{selectedRecord.consultantId}</Descriptions.Item>
            <Descriptions.Item label="Project ID">{selectedRecord.projectId}</Descriptions.Item>
            <Descriptions.Item label="Agreed Price">{selectedRecord.agreedPrice}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedRecord.description}</Descriptions.Item>
            <Descriptions.Item label="Request Status">{selectedRecord.requestStatus}</Descriptions.Item>
            <Descriptions.Item label="Maintenance Status">{selectedRecord.maintenanceStatus}</Descriptions.Item>
            <Descriptions.Item label="Scheduled Date">{selectedRecord.scheduledDate}</Descriptions.Item>
            <Descriptions.Item label="Start Date">{selectedRecord.startDate}</Descriptions.Item>
            <Descriptions.Item label="Completion Date">{selectedRecord.completionDate}</Descriptions.Item>
            <Descriptions.Item label="Assigned To">{selectedRecord.assignedTo}</Descriptions.Item>
            <Descriptions.Item label="Cancellation Reason">
              {selectedRecord.cancellationReason || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">{selectedRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="Updated At">{selectedRecord.updatedAt}</Descriptions.Item>
            <Descriptions.Item label="Maintenance Notes">{selectedRecord.maintenanceNotes}</Descriptions.Item>
            <Descriptions.Item label="Attachments">{selectedRecord.attachments}</Descriptions.Item>
            <Descriptions.Item label="Maintenance Images">
              {selectedRecord.maintenanceImages?.length ? (
                <Image.PreviewGroup>
                  {selectedRecord.maintenanceImages.map((url, index) => (
                    <Image key={index} width={100} src={url} />
                  ))}
                </Image.PreviewGroup>
              ) : (
                "No Images"
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceRequest;
