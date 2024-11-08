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
import { FaEdit } from "react-icons/fa";
import { SearchOutlined, EllipsisOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import moment from "moment";
import UpdateStatusModal from './update-status-modal';

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

  useEffect(() => {
    initialFetch();
  }, []);

  const initialFetch = async () => {
    try {
      setInitialLoading(true);
      await fetchRequests(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRequests = async (isInitialFetch) => {
    try {
      setLoading(true);
      const response = await api.get("/api/ConsultationRequests");
      
      if (Array.isArray(response.data)) {
        const customRequests = response.data
          .filter(request => request.status !== "CANCELLED" && request.customDesign === true)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setRequests(prevRequests => {
          if (JSON.stringify(prevRequests) !== JSON.stringify(customRequests)) {
            if (!isInitialFetch) {
              customRequests.forEach(request => {
                if (!prevRequests.find(pr => pr.id === request.id)) {
                  toast.info(`Có yêu cầu thiết kế tùy chỉnh mới từ: ${request.customerName}`);
                }
              });
            }
            return customRequests;
          }
          return prevRequests;
        });
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
    fetchRequests(false);
  };

  useEffect(() => {
    console.log("Current requests:", requests);
    console.log("Current filtered requests:", filteredRequests);
  }, [requests, filteredRequests]);

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
            <Tooltip title="Cập nhật trạng thái">
              <FaEdit
                onClick={() => handleEditStatus(record)}
                style={{ cursor: "pointer", fontSize: "18px" }}
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
    </div>
  );
};

export default CustomDesignRequest; 