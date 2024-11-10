import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Tag,
  Typography,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Tooltip,
  Form,
} from "antd";
import { FaEdit, FaPaperPlane, FaImages } from "react-icons/fa";
import { SearchOutlined, EllipsisOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import moment from "moment";
import UpdateStatusModal from './update-status-modal';
import CreateDesignRequestModal from './create-design-request-modal';
import ViewDesignDetailsModal from './view-design-details-modal';

const { Text } = Typography;

const CustomDesignRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCreateDesignModalVisible, setIsCreateDesignModalVisible] = useState(false);
  const [completedDesigns, setCompletedDesigns] = useState({});
  const [isDesignDetailsModalVisible, setIsDesignDetailsModalVisible] = useState(false);
  const [selectedDesignDetails, setSelectedDesignDetails] = useState(null);

  useEffect(() => {
    initialFetch();
    fetchCompletedDesigns();
  }, []);

  const initialFetch = async () => {
    try {
      setInitialLoading(true);
      await fetchRequests();
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/ConsultationRequests");
      
      if (Array.isArray(response.data)) {
        const customRequests = response.data
          .filter(request => request.status !== "CANCELLED" && request.customDesign === true)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setRequests(customRequests);
      }
    } catch (error) {
      toast.error(
        error.response
          ? `Error: ${error.response.status} - ${error.response.data.message}`
          : "Không thể tải danh sách yêu cầu thiết kế"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedDesigns = async (requestId) => {
    try {
      const response = await api.get(`/api/design-requests/pending-review`);
      if (Array.isArray(response.data)) {
        const designMap = {};
        response.data.forEach(design => {
          designMap[design.consultationId] = true;
        });
        setCompletedDesigns(designMap);
      }
    } catch (error) {
      console.error("Error fetching completed designs:", error);
    }
  };

  useEffect(() => {
    const filtered = requests.filter(
      (request) =>
        (statusFilter === "ALL" || request.status === statusFilter) &&
        Object.values(request).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
    );
    setFilteredRequests(filtered);
  }, [searchText, requests, statusFilter]);

  const handleEditStatus = (record) => {
    if (record.status === "COMPLETED") {
      toast.error("Không thể chỉnh sửa yêu cầu đã hoàn thành");
      return;
    }
    setSelectedRecord(record);
    setIsStatusModalVisible(true);
  };

  const handleStatusUpdateSuccess = () => {
    fetchRequests();
  };

  useEffect(() => {
    console.log("Current requests:", requests);
    console.log("Current filtered requests:", filteredRequests);
  }, [requests, filteredRequests]);

  const handleSendRequest = (record) => {
    setSelectedRecord(record);
    setIsCreateDesignModalVisible(true);
  };

  const handleViewDesignDetails = async (consultationId) => {
    try {
      const response = await api.get(`/api/design-requests/pending-review`);
      const designDetails = response.data.find(design => design.consultationId === consultationId);
      
      if (designDetails) {
        setSelectedDesignDetails(designDetails);
        setIsDesignDetailsModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching design details:", error);
      toast.error("Không thể tải thông tin thiết kế");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên Khách Hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "customerPhone",
      key: "customerPhone",
    },
    {
      title: "Địa Chỉ",
      dataIndex: "customerAddress",
      key: "customerAddress",
    },
    {
      title: "Loại Hồ",
      dataIndex: "preferredStyle",
      key: "preferredStyle",
    },
    {
      title: "Kích Thước",
      dataIndex: "dimensions",
      key: "dimensions",
    },
    {
      title: "Yêu Cầu Thiết Kế",
      dataIndex: "requirements",
      key: "requirements",
      render: (text) => {
        if (!text) return null;
        const shortText = text.slice(0, 50) + "...";
        return (
          <>
            <Text>{shortText}</Text>
            {text.length > 50 && (
              <Button
                type="link"
                onClick={() => showFullDescription(text)}
                icon={<EllipsisOutlined />}
              >
                Xem thêm
              </Button>
            )}
          </>
        );
      },
    },
    {
      title: "Ngân Sách",
      dataIndex: "budget",
      key: "budget",
    },
    {
      title: "Ghi Chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "Không xác định";

        switch (status) {
          case "PENDING":
            color = "gold";
            text = "Đang chờ";
            break;
          case "IN_PROGRESS":
            color = "blue";
            text = "Đang thực hiện";
            break;
          case "PROCEED_DESIGN":
            color = "cyan";
            text = "Chuyển sang thiết kế";
            break;
          case "COMPLETED":
            color = "green";
            text = "Hoàn thành";
            break;
          default:
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.status !== "COMPLETED" && (
            <>
              <Tooltip title="Cập nhật trạng thái">
                <FaEdit
                  onClick={() => handleEditStatus(record)}
                  style={{ cursor: "pointer", fontSize: "18px" }}
                />
              </Tooltip>
              {record.status === "PROCEED_DESIGN" && (
                <Tooltip title="Gửi yêu cầu cho quản lý">
                  <FaPaperPlane
                    onClick={() => handleSendRequest(record)}
                    style={{ cursor: "pointer", fontSize: "16px", color: '#1890ff' }}
                  />
                </Tooltip>
              )}
            </>
          )}
          {completedDesigns[record.id] && (
            <Tooltip title="Xem thiết kế hoàn thành">
              <FaImages
                onClick={() => handleViewDesignDetails(record.id)}
                style={{ color: '#52c41a', fontSize: '16px', cursor: 'pointer' }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const showFullDescription = (text) => {
    Modal.info({
      title: "Chi tiết yêu cầu thiết kế",
      content: <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>,
      width: 600,
    });
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            placeholder="Lọc theo trạng thái"
          >
            <Select.Option value="ALL">Tất cả</Select.Option>
            <Select.Option value="PENDING">Đang chờ</Select.Option>
            <Select.Option value="IN_PROGRESS">Đang thực hiện</Select.Option>
            <Select.Option value="COMPLETED">Đã hoàn thành</Select.Option>
          </Select>
        </Col>
        <Col>
          <Input
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredRequests}
        loading={initialLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        size="small"
        locale={{ emptyText: 'Không có yêu cầu thiết kế tùy chỉnh nào' }}
      />
      
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: 16, color: '#999' }}>
          <p>Số lượng requests: {requests.length}</p>
          <p>Số lượng filtered requests: {filteredRequests.length}</p>
        </div>
      )}

      <UpdateStatusModal
        visible={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        onSuccess={handleStatusUpdateSuccess}
        record={selectedRecord}
      />

      <CreateDesignRequestModal
        visible={isCreateDesignModalVisible}
        onCancel={() => setIsCreateDesignModalVisible(false)}
        onSuccess={fetchRequests}
        record={selectedRecord}
      />

      <ViewDesignDetailsModal
        visible={isDesignDetailsModalVisible}
        onCancel={() => setIsDesignDetailsModalVisible(false)}
        designDetails={selectedDesignDetails}
      />
    </div>
  );
};

export default CustomDesignRequest; 