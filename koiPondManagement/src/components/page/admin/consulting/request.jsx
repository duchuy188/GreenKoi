import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  message,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  InputNumber,
  Tag,
  Typography,
  Tooltip,
} from "antd";
import { FaEdit, FaShoppingCart } from "react-icons/fa";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import moment from "moment";
import { EllipsisOutlined } from "@ant-design/icons";

const { Text } = Typography;

const RequestConsulting = () => {
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [editOrderModalVisible, setEditOrderModalVisible] = useState(false);
  const [editOrderForm] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedRows, setExpandedRows] = useState({});
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [designDetailModalVisible, setDesignDetailModalVisible] =
    useState(false);
  const [designDetail, setDesignDetail] = useState("");
  const [isShowingDetail, setIsShowingDetail] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");

  useEffect(() => {
    fetchConsultationRequests();
  }, []);

  useEffect(() => {
    const filtered = consultationRequests.filter(
      (request) =>
        (statusFilter === "ALL" || request.status === statusFilter) &&
        Object.values(request).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
    );
    setFilteredRequests(filtered);
  }, [searchText, consultationRequests, statusFilter]);

  const fetchConsultationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/ConsultationRequests");
      //console.log("Raw consultation requests:", response.data);
      if (Array.isArray(response.data)) {
        const requests = response.data
          .filter((request) => request.status !== "CANCELLED")
          .map((request) => {
            // console.log("Individual request:", request);
            return request;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setConsultationRequests(requests);
      } else if (response.data.consultationRequests) {
        const filteredRequests = response.data.consultationRequests
          .filter((request) => request.status !== "CANCELLED")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setConsultationRequests(filteredRequests);
      } else {
        setConsultationRequests([]);
        toast.error(
          "Failed to load consultation requests. Unexpected data structure."
        );
      }
    } catch (error) {
      console.error("Error fetching consultation requests:", error);
      toast.error(
        error.response
          ? `Error: ${error.response.status} - ${error.response.data.message}`
          : "Network error. Please check your connection."
      );
      setConsultationRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (record) => {
    setSelectedRequest(record);
    form.setFieldsValue({ status: record.status });
    setEditModalVisible(true);
  };

  const handleUpdateStatus = async (values) => {
    try {
      setLoading(true);
      await api.put(
        `/api/ConsultationRequests/${selectedRequest.id}/status?newStatus=${values.status}`
      );
      toast.success("Cập nhật trạng thái thành công");
      setEditModalVisible(false);
      await fetchConsultationRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = (record) => {
    if (!record.customerId) {
      console.error("Missing customerId in record:", record);
      message.error("Customer ID is missing. Cannot create order.");
      return;
    }

    const description =
      record.designDescription || "Thiết kế hồ cá Koi phong cách hiện đại";

    editOrderForm.setFieldsValue({
      name: `Dự án của ${record.customerName}`,
      description: description,
      totalPrice: 0,
      depositAmount: 0,
      startDate: moment(),
      endDate: moment().add(30, "days"),
      designId: record.designId,
      address: record.customerAddress,
      customerId: record.customerId,
      consultantId: record.consultantId || "",
    });

    setDescriptionValue(description);
    setSelectedRequest(record);
    setIsShowingDetail(false);
    setEditOrderModalVisible(true);
  };

  const handleEditOrderSubmit = async (values) => {
    try {
      setLoading(true);

      if (!selectedRequest) {
        throw new Error("No request selected");
      }

      const projectData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        promotionId: null,
        address: values.address,
        customerId: values.customerId,
        consultantId: values.consultantId || null,
      };

      const response = await api.post("/api/projects", projectData);
      if (response.data) {
        toast.success("Tạo đơn hàng thành công");
        await updateConsultationStatus(selectedRequest.id, "COMPLETED");
        await fetchConsultationRequests();
        setEditOrderModalVisible(false);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(
        "Không thể tạo đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (id, newStatus) => {
    try {
      await api.put(
        `/api/ConsultationRequests/${id}/status?newStatus=${newStatus}`
      );
      toast.success("Cập nhật trạng thái yêu cầu thành công");
    } catch (error) {
      console.error("Error updating consultation status:", error);
      toast.error("Không thể cập nhật trạng thái yêu cầu");
    }
  };

  const toggleDescription = (recordId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
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
      title: "Địa Chỉ Khách Hàng",
      dataIndex: "customerAddress",
      key: "customerAddress",
    },
    {
      title: "Mã Khách Hàng",
      dataIndex: "customerId",
      key: "customerId",
      hidden: true,
    },
    {
      title: "Tên Thiết Kế",
      dataIndex: "designName",
      key: "designName",
    },
    {
      title: "Mô Tả Thiết Kế",
      dataIndex: "designDescription",
      key: "designDescription",
      render: (text, record) => {
        if (!text) return null;
        const shortText = text.slice(0, 50) + "...";

        return (
          <>
            <Text>{shortText}</Text>
            {text.length > 50 && (
              <Button
                type="link"
                onClick={() => {
                  setSelectedDescription(text);
                  setDescriptionModalVisible(true);
                }}
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
      title: "Ghi Chú Khách Hàng",
      dataIndex: "notes",
      key: "customerNote",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
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
      title: "Ngày Từ",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
    },
    {
      title: "Ngày Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Cập nhật trạng thái">
            <FaEdit
              onClick={() => handleEditStatus(record)}
              style={{ cursor: "pointer", fontSize: "18px" }}
            />
          </Tooltip>
          {record.status === "IN_PROGRESS" && (
            <Tooltip title="Tạo đơn hàng">
              <FaShoppingCart
                onClick={() => handleCreateOrder(record)}
                style={{
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#1890ff",
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      hidden: true,
    },
  ];

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  // Modify the getResponsiveColumns function
  const getResponsiveColumns = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      return columns.filter((col) =>
        ["stt", "customerName", "status", "actions"].includes(col.key)
      );
    } else if (screenWidth < 1024) {
      return columns.filter((col) =>
        [
          "stt",
          "customerName",
          "customerPhone",
          "status",
          "createdAt",
          "actions",
        ].includes(col.key)
      );
    } else if (screenWidth < 1440) {
      return columns.filter((col) =>
        [
          "stt",
          "customerName",
          "customerPhone",
          "customerAddress",
          "designName",
          "status",
          "createdAt",
          "actions",
        ].includes(col.key)
      );
    }
    return columns.filter((column) => !column.hidden);
  };

  // Add this new state
  const [responsiveColumns, setResponsiveColumns] = useState(
    getResponsiveColumns()
  );

  // Add this new useEffect
  useEffect(() => {
    const handleResize = () => {
      setResponsiveColumns(getResponsiveColumns());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Thêm hàm để tạo markup an toàn (nếu chưa có)
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  return (
    <div>
      <h1>Yêu cầu của khách hàng</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm yêu cầu"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={statusFilter}
          style={{ width: 120 }}
          onChange={handleStatusFilterChange}
        >
          <Select.Option value="ALL">Tất cả</Select.Option>
          <Select.Option value="PENDING">Đang chờ</Select.Option>
          <Select.Option value="IN_PROGRESS">Đang thực hiện</Select.Option>
          <Select.Option value="COMPLETED">Đã hoàn thành</Select.Option>
        </Select>
      </Space>
      <Table
        columns={responsiveColumns}
        dataSource={filteredRequests}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        size="small"
        style={{ overflowX: "hidden" }}
      />
      <Modal
        title="Cập nhật trạng thái"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateStatus}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="PENDING">Đang chờ</Select.Option>
              <Select.Option value="IN_PROGRESS">Đang thực hiện</Select.Option>
              <Select.Option value="COMPLETED">Đã hoàn thành</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật trạng thái
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Tạo đơn hàng"
        open={editOrderModalVisible}
        onCancel={() => setEditOrderModalVisible(false)}
        footer={null}
      >
        <Form
          form={editOrderForm}
          onFinish={handleEditOrderSubmit}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true }]}
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item
            name="description"
            label="Nội dung thiết kế"
            rules={[{ required: true }]}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {!isShowingDetail ? (
                <Button type="primary" onClick={() => setIsShowingDetail(true)}>
                  Xem chi tiết
                </Button>
              ) : (
                <>
                  <div
                    dangerouslySetInnerHTML={createMarkup(descriptionValue)}
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: "2px",
                      padding: "10px",
                      minHeight: "200px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      backgroundColor: "#fff",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}
                  />
                  <Button onClick={() => setIsShowingDetail(false)}>
                    Thu gọn
                  </Button>
                </>
              )}
            </Space>
          </Form.Item>
          <Form.Item
            name="totalPrice"
            label="Tổng giá tiền"
            rules={[
              { required: true, message: "Vui lòng nhập tổng giá tiền" },
              { type: "number", min: 0, message: "Giá tiền không được âm" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="depositAmount"
            label="Số tiền đặt cọc"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền đặt cọc" },
              {
                type: "number",
                min: 0,
                message: "Số tiền đặt cọc không được âm",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true }]}
            hidden
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true }]}
            hidden
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="designId"
            label="Design ID"
            rules={[{ required: true }]}
            hidden
          >
            <Input hidden />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true }]}
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="customerId"
            label="Customer ID"
            rules={[{ required: true }]}
            hidden
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item name="consultantId" label="Consultant ID" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo đơn hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Mô tả thiết kế"
        open={descriptionModalVisible}
        onCancel={() => setDescriptionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDescriptionModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
        style={{ top: 20 }}
      >
        <div
          style={{
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            padding: "0 16px",
            marginRight: -16,
            paddingRight: 16,
          }}
        >
          <div
            dangerouslySetInnerHTML={createMarkup(selectedDescription)}
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: "rgba(0, 0, 0, 0.85)",
            }}
          />
        </div>
      </Modal>
      <Modal
        title="Chi tiết nội dung thiết kế"
        open={designDetailModalVisible}
        onCancel={() => setDesignDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDesignDetailModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Input.TextArea
          value={designDetail}
          readOnly
          rows={15}
          style={{ width: "100%" }}
        />
      </Modal>
    </div>
  );
};

export default RequestConsulting;
