import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Descriptions,
  Image,
  Rate,
  Input,
  Space,
  Select,
  Card,
  DatePicker,
} from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  WalletOutlined,
  ToolOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "/src/components/config/axios";
import moment from "moment";
import { toast } from "react-toastify";

function MaintenanceRequests() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchDate, setSearchDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedCancelId, setSelectedCancelId] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    searchDate: null,
    statusFilter: "ALL",
    paymentFilter: "ALL",
  });
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  const statusOptions = [
    { value: "ALL", label: "Tất Cả Trạng Thái" },
    { value: "PENDING", label: "Đang Xem Xét" },
    { value: "CONFIRMED", label: "Đã Xác Nhận" },
    { value: "COMPLETED", label: "Hoàn Thành" },
    { value: "CANCELLED", label: "Đã Hủy" },
  ];

  const paymentOptions = [
    { value: "ALL", label: "Tất Cả Thanh Toán" },
    { value: "UNPAID", label: "Chưa Thanh Toán" },
    { value: "DEPOSIT_PAID", label: "Đã Cọc" },
    { value: "FULLY_PAID", label: "Đã Thanh Toán" },
  ];

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customerId");

      if (!customerId) {
        toast.error(
          "Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại."
        );
        return;
      }

      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await api.get(
        `/api/maintenance-requests/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedData = response.data
        .map((item) => ({
          ...item,
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          customerEmail: item.customerEmail,
          customerAddress: item.customerAddress,
          projectName: item.projectName,
          consultantId: item.consultantId,
          maintenanceStatus: item.maintenanceStatus,
          agreedPrice: item.agreedPrice,
          scheduledDate: item.scheduledDate,
          startDate: item.startDate,
          assignedTo: item.assignedTo,
          cancellationReason: item.cancellationReason,
          maintenanceNotes: item.maintenanceNotes,
          maintenanceImages: item.maintenanceImages || [],
          attachments: item.attachments ? item.attachments.split(",") : [],
          key: item.id,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMaintenanceRequests(formattedData);
    } catch (err) {
      console.error("Error fetching maintenance requests:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể tải danh sách yêu cầu bảo trì. Vui lòng thử lại sau."
      );
    }
  };

  const handleMaintenanceCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/api/maintenance-requests/${id}/cancel`,
        { cancellationReason: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Yêu cầu bảo trì đã được huỷ thành công");
      setCancelModalVisible(false);
      setCancelReason("");
      setSelectedCancelId(null);
      fetchMaintenanceRequests();
    } catch (err) {
      console.error("Error cancelling maintenance request:", err);
      toast.error("Không thể huỷ yêu cầu bảo trì");
    }
  };

  const showCancelModal = (id) => {
    setSelectedCancelId(id);
    setCancelModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const getFilteredData = () => {
    return maintenanceRequests.filter((item) => {
      const matchStatus =
        statusFilter === "ALL" ? true : item.requestStatus === statusFilter;
      const matchPayment =
        paymentFilter === "ALL" ? true : item.paymentStatus === paymentFilter;
      const matchDate = !searchDate
        ? true
        : moment(item.createdAt).format("YYYY-MM-DD") ===
          searchDate.format("YYYY-MM-DD");
      return matchStatus && matchPayment && matchDate;
    });
  };

  const handleApplyFilters = () => {
    setSearchDate(tempFilters.searchDate);
    setStatusFilter(tempFilters.statusFilter);
    setPaymentFilter(tempFilters.paymentFilter);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setTempFilters({
      searchDate: null,
      statusFilter: "ALL",
      paymentFilter: "ALL",
    });
    setSearchDate(null);
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setFilterModalVisible(false);
  };

  const renderFilterModal = () => (
    <Modal
      title="Lọc Thông Tin"
      visible={filterModalVisible}
      onCancel={() => setFilterModalVisible(false)}
      footer={[
        <Button key="reset" onClick={handleResetFilters}>
          Đặt Lại
        </Button>,
        <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
          Đóng
        </Button>,
        <Button key="apply" type="primary" onClick={handleApplyFilters}>
          Áp Dụng
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <div>
          <div style={{ marginBottom: 8 }}>Ngày Yêu Cầu:</div>
          <DatePicker
            placeholder="Chọn ngày yêu cầu"
            value={tempFilters.searchDate}
            onChange={(value) =>
              setTempFilters({ ...tempFilters, searchDate: value })
            }
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            allowClear
          />
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>Trạng Thái:</div>
          <Select
            value={tempFilters.statusFilter}
            onChange={(value) =>
              setTempFilters({ ...tempFilters, statusFilter: value })
            }
            style={{ width: "100%" }}
            options={statusOptions}
          />
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>Thanh Toán:</div>
          <Select
            value={tempFilters.paymentFilter}
            onChange={(value) =>
              setTempFilters({ ...tempFilters, paymentFilter: value })
            }
            style={{ width: "100%" }}
            options={paymentOptions}
          />
        </div>
      </Space>
    </Modal>
  );

  const actionButtonStyle = {
    width: "100%",
    marginBottom: "8px",
    borderRadius: "4px",
    height: "32px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const handleViewNote = (note) => {
    setSelectedNote(note);
    setNoteModalVisible(true);
  };

  const renderNoteModal = () => (
    <Modal
      title={
        <div style={{ 
          borderBottom: '1px solid #f0f0f0',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: 500,
          margin: '-20px -24px 20px'
        }}>
          Chi Tiết Ghi Chú
        </div>
      }
      open={noteModalVisible}
      onCancel={() => setNoteModalVisible(false)}
      footer={[
        <Button 
          key="close"
          onClick={() => setNoteModalVisible(false)}
        >
          Đóng
        </Button>
      ]}
      width={500}
      centered
    >
      <div style={{ padding: '0 0 20px' }}>
        {selectedNote || "Không có ghi chú"}
      </div>
    </Modal>
  );

  const columns = [
    {
      title: "TÊN DỰ ÁN",
      dataIndex: "projectName",
      key: "projectName",
      width: 130,
    },
    {
      title: "NGÀY YÊU CẦU",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "GHI CHÚ",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Button
          type="text"
          onClick={() => handleViewNote(text)}
          icon={<FileTextOutlined />}
          style={{ color: '#1890ff' }}
        >
          Xem ghi chú
        </Button>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "requestStatus",
      key: "requestStatus",
      width: 150,
      render: (status) => (
        <span
          style={{
            padding: "4px 12px",
            borderRadius: "4px",
            backgroundColor:
              status === "PENDING"
                ? "#fff7e6"
                : status === "REVIEWING"
                ? "#fff7e6"
                : status === "CONFIRMED"
                ? "#e6f7ff"
                : status === "COMPLETED"
                ? "#f6ffed"
                : status === "CANCELLED"
                ? "#fff1f0"
                : "#f0f0f0",
            color:
              status === "PENDING"
                ? "#faad14"
                : status === "CONFIRMED"
                ? "#1890ff"
                : status === "COMPLETED"
                ? "#52c41a"
                : status === "CANCELLED"
                ? "#f5222d"
                : "#000000",
            border: `1px solid ${
              status === "PENDING"
                ? "#ffd591"
                : status === "CONFIRMED"
                ? "#91d5ff"
                : status === "COMPLETED"
                ? "#b7eb8f"
                : status === "CANCELLED"
                ? "#ffa39e"
                : "#d9d9d9"
            }`,
          }}
        >
          {status === "PENDING"
            ? "Đang Xem Xét"
            : status === "REVIEWING"
            ? "Đang Xem Xét"
            : status === "CONFIRMED"
            ? "Đã Xác Nhận"
            : status === "COMPLETED"
            ? "Hoàn Thành"
            : status === "CANCELLED"
            ? "Đã Hủy"
            : status}
        </span>
      ),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      width: 130,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {record.requestStatus === "PENDING" && (
            <Button
              style={{
                ...actionButtonStyle,
                backgroundColor: "#00bcd4",
              }}
              onClick={() => showCancelModal(record.id)}
            >
              <ToolOutlined /> Huỷ Bảo Trì
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    const renderMaintenanceStatus = (status) => {
      const style = {
        padding: "4px 12px",
        borderRadius: "4px",
        backgroundColor:
          status === "NOT_STARTED"
            ? "#f0f0f0"
            : status === "IN_PROGRESS"
            ? "#e6f7ff"
            : status === "ASSIGNED"
            ? "#fff7e6"
            : status === "COMPLETED"
            ? "#f6ffed"
            : "#f0f0f0",
        color:
          status === "NOT_STARTED"
            ? "#000000"
            : status === "IN_PROGRESS"
            ? "#1890ff"
            : status === "ASSIGNED"
            ? "#faad14"
            : status === "COMPLETED"
            ? "#52c41a"
            : "#000000",
        border: `1px solid ${
          status === "NOT_STARTED"
            ? "#d9d9d9"
            : status === "IN_PROGRESS"
            ? "#91d5ff"
            : status === "ASSIGNED"
            ? "#ffd591"
            : status === "COMPLETED"
            ? "#b7eb8f"
            : "#d9d9d9"
        }`,
      };

      return (
        <span style={style}>
          {status === "NOT_STARTED"
            ? "Chưa Bắt Đầu"
            : status === "IN_PROGRESS"
            ? "Đang Thực Hiện"
            : status === "ASSIGNED"
            ? "Đã Phân Công"
            : status === "COMPLETED"
            ? "Hoàn Thành"
            : status}
        </span>
      );
    };
  };

  const renderCancelModal = () => (
    <Modal
      title={
        <div style={{ 
          borderBottom: '1px solid #f0f0f0',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: 500,
          margin: '-20px -24px 20px'
        }}>
          Huỷ Yêu Cầu Bảo Trì
        </div>
      }
      open={cancelModalVisible}
      onCancel={() => {
        setCancelModalVisible(false);
        setCancelReason("");
        setSelectedCancelId(null);
      }}
      footer={[
        <Button 
          key="cancel"
          onClick={() => {
            setCancelModalVisible(false);
            setCancelReason("");
            setSelectedCancelId(null);
          }}
          style={{ marginRight: 8 }}
        >
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!cancelReason.trim()}
          onClick={() => handleMaintenanceCancel(selectedCancelId)}
          style={{ backgroundColor: '#1890ff' }}
        >
          Xác Nhận Huỷ
        </Button>
      ]}
      width={500}
      centered
    >
      <div style={{ padding: '0 0 20px' }}>
        <Input.TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Vui lòng nhập lý do huỷ yêu cầu bảo trì..."
          style={{ 
            padding: '12px',
            borderRadius: '6px',
            resize: 'none'
          }}
        />
      </div>
    </Modal>
  );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button
          type="primary"
          onClick={() => setFilterModalVisible(true)}
          style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
        >
          <SearchOutlined /> Lọc
        </Button>
      </div>
      <Table
        dataSource={getFilteredData()}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} yêu cầu`,
        }}
        className="maintenance-table"
      />
      {renderDetailModal()}
      {renderCancelModal()}
      {renderFilterModal()}
      {renderNoteModal()}
    </div>
  );
}

export default MaintenanceRequests;
