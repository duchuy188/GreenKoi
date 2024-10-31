import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Descriptions,
  message,
  Image,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import api from "/src/components/config/axios";
import moment from "moment";

function MaintenanceRequests() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customerId");
      if (!customerId) {
        throw new Error("No customer ID found");
      }

      const response = await api.get(
        `/api/maintenance-requests/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedData = response.data
        .filter((item) => item.requestStatus !== "CANCELLED")
        .map((item) => ({
          ...item,
          attachments: item.attachments || [],
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMaintenanceRequests(formattedData);
    } catch (err) {
      console.error("Error fetching maintenance requests:", err);
      message.error("Không tải được yêu cầu bảo trì");
    }
  };

  const handleMaintenanceCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/api/maintenance-requests/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Yêu cầu bảo trì đã được hủy thành công");
      fetchMaintenanceRequests();
    } catch (err) {
      console.error("Lỗi khi hủy yêu cầu bảo trì:", err);
      message.error("Không thể hủy yêu cầu bảo trì");
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: "Hình Ảnh",
      dataIndex: "attachments",
      key: "attachments",
      render: (attachments) =>
        attachments && typeof attachments === "string" ? (
          <Image width={50} src={attachments} alt="Attachment" />
        ) : null,
    },
    {
      title: "Ngày Yêu Cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng Thái",
      dataIndex: "requestStatus",
      key: "requestStatus",
    },
    {
      title: "Ghi Chú",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) =>
        record.requestStatus === "PENDING" ? (
          <span>
            <Button
              onClick={() => handleViewDetails(record)}
              style={{ marginRight: "10px" }}
            >
              Xem Chi Tiết
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn hủy yêu cầu này?"
              onConfirm={() => handleMaintenanceCancel(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger>
                Hủy
              </Button>
            </Popconfirm>
          </span>
        ) : (
          <Button onClick={() => handleViewDetails(record)}>
            Xem Chi Tiết
          </Button>
        ),
    },
  ];

  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    return (
      <Modal
        title="Chi tiết yêu cầu bảo trì"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Descriptions column={1}>
          <Descriptions.Item label="Mã Dự Án">
            {selectedRequest.projectId}
          </Descriptions.Item>
          <Descriptions.Item label="Hình Ảnh">
            {selectedRequest.attachments}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày Yêu Cầu">
            {moment(selectedRequest.createdAt).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Mô Tả">
            {selectedRequest.description}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng Thái Yêu Cầu">
            {selectedRequest.requestStatus}
          </Descriptions.Item>

          {selectedRequest.requestStatus === "CONFIRMED" && (
            <Descriptions.Item label="Giá Đã Chốt">
              {selectedRequest.agreedPrice}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Modal>
    );
  };

  return (
    <>
      <Table dataSource={maintenanceRequests} columns={columns} rowKey="id" />
      {renderDetailModal()}
    </>
  );
}

export default MaintenanceRequests;
