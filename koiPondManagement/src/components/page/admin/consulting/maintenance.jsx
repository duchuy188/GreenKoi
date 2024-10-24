import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Tabs,
} from "antd";
import api from "../../../config/axios";
import { toast } from "react-toastify";

const { TabPane } = Tabs;

const MaintenanceRequest = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);




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
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaintenanceDetails = (record) => {
    // Implement logic to view maintenance request details
    console.log("Viewing maintenance details:", record);
    // You can open a modal or navigate to a details page here
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
          <Button onClick={() => handleViewMaintenanceDetails(record)}>View Details</Button>
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
      />
    </div>
  );
};

export default MaintenanceRequest;
