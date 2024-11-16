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
  Radio,
} from "antd";
import { FaEdit, FaShoppingCart } from "react-icons/fa";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import moment from "moment";
import { EllipsisOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";
import CustomDesignRequest from "./custom-design-request";

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [requestType, setRequestType] = useState("standard");

  useEffect(() => {
    // Initial fetch
    initialFetch();

    // Setup polling
    const pollingInterval = setInterval(() => {
      pollRequests();
    }, 10000);

    return () => clearInterval(pollingInterval);
  }, [requestType]);

  const initialFetch = async () => {
    try {
      setInitialLoading(true);
      await fetchConsultationRequests(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const pollRequests = async () => {
    try {
      setIsPolling(true);
      await fetchConsultationRequests(false);
    } finally {
      setIsPolling(false);
    }
  };

  const fetchConsultationRequests = async (isInitialFetch) => {
    try {
      const response = await api.get("/api/ConsultationRequests");

      const processRequests = (rawRequests) => {
        const requests = rawRequests
          .filter((request) => request.status !== "CANCELLED")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const filteredRequests = requests.filter((request) =>
          requestType === "standard"
            ? !request.customDesign
            : request.customDesign
        );

        setConsultationRequests((prevRequests) => {
          // Lọc các request cũ theo loại hiện tại
          const prevFilteredRequests = prevRequests.filter((request) =>
            requestType === "standard"
              ? !request.customDesign
              : request.customDesign
          );

          // Kiểm tra xem có request mới không bằng cách so sánh ID và thời gian tạo
          if (!isInitialFetch) {
            const newRequests = filteredRequests.filter((newReq) => {
              const existingReq = prevFilteredRequests.find(
                (prevReq) => prevReq.id === newReq.id
              );
              if (!existingReq) return true;
              return (
                new Date(newReq.createdAt) > new Date(existingReq.createdAt)
              );
            });

            if (newRequests.length > 0) {
              // Chỉ hiện thông báo nếu request mới thuộc loại đang xem
              const isCurrentType = newRequests.some((req) =>
                requestType === "standard"
                  ? !req.customDesign
                  : req.customDesign
              );
              if (isCurrentType) {
                toast.info(
                  `Có yêu cầu tư vấn mới từ: ${newRequests[0].customerName}`
                );
              }
            }
          }

          // Chỉ cập nhật state nếu có sự thay đổi
          if (
            JSON.stringify(prevFilteredRequests) !==
            JSON.stringify(filteredRequests)
          ) {
            return filteredRequests;
          }
          return prevRequests;
        });
      };

      if (Array.isArray(response.data)) {
        processRequests(response.data);
      } else if (response.data.consultationRequests) {
        processRequests(response.data.consultationRequests);
      }
    } catch (error) {
      console.error("Error fetching consultation requests:", error);
      toast.error(
        error.response
          ? `Error: ${error.response.status} - ${error.response.data.message}`
          : "Network error. Please check your connection."
      );
    }
  };

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

  const handleEditStatus = (record) => {
    if (record.status === "COMPLETED") {
      toast.error("Không thể chỉnh sửa yêu cầu đã hoàn thành");
      return;
    }
    setSelectedRequest(record);
    form.setFieldsValue({ status: record.status });
    setEditModalVisible(true);
  };

  const handleUpdateStatus = async (values) => {
    try {
      setUpdateStatusLoading(true);

      // Check if trying to move from IN_PROGRESS to PENDING
      if (
        selectedRequest.status === "IN_PROGRESS" &&
        values.status === "PENDING"
      ) {
        toast.error(
          "Không thể chuyển từ trạng thái 'Đang thực hiện' về 'Đang chờ'"
        );
        return;
      }
      if (
        selectedRequest.status === "COMPLETED" &&
        (values.status === "IN_PROGRESS" || values.status === "PENDING")
      ) {
        toast.error(
          "Không thể chuyển từ trạng thái 'Hoàn thành' về trạng thái trước đó"
        );
        return;
      }

      await api.put(
        `/api/ConsultationRequests/${selectedRequest.id}/status?newStatus=${values.status}`
      );

      toast.success("Cập nhật trạng thái thành công");
      setEditModalVisible(false);
      await fetchConsultationRequests();
    } catch (error) {
      console.error("Error updating status:", error);

      // Handle specific error cases
      if (error.response?.status === 500) {
        if (values.status === "IN_PROGRESS") {
          toast.error(
            "Không thể cập nhật trạng thái. Yêu cầu này có thể đã bị hủy."
          );
        } else {
          toast.error(
            "Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại sau."
          );
        }
      } else {
        toast.error(
          error.response?.data?.message ||
            "Không thể cập nhật trạng thái. Vui lòng thử lại sau."
        );
      }
    } finally {
      setUpdateStatusLoading(false);
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
      setCreateOrderLoading(true);

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
        editOrderForm.resetFields();
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(
        "Không thể tạo đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setCreateOrderLoading(false);
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
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
    },
    {
      title: "Ngày Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
    },
    {
      title: "Hành động",
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

  const renderRequestTypeSwitch = () => {
    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Radio.Group
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            buttonStyle="solid"
            style={{ marginBottom: 16 }}
          >
            <Radio.Button value="standard">Thiết kế có sẵn</Radio.Button>
            <Radio.Button value="custom">Thiết kế tùy chỉnh</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
    );
  };

  useEffect(() => {
    fetchConsultationRequests(true);
  }, [requestType]);

  return (
    <div>
      <h1>Yêu cầu của khách hàng</h1>

      {renderRequestTypeSwitch()}

      {requestType === "standard" ? (
        // Hiển thị bảng thiết kế có sẵn
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Select
                style={{ width: 200 }}
                value={statusFilter}
                onChange={handleStatusFilterChange}
                placeholder="Lọc theo trạng thái"
              >
                <Select.Option value="ALL">Tất cả</Select.Option>
                <Select.Option value="PENDING">Đang chờ</Select.Option>
                <Select.Option value="IN_PROGRESS">
                  Đang thực hiện
                </Select.Option>
                <Select.Option value="COMPLETED">Đã hoàn thành</Select.Option>
              </Select>
            </Col>
            <Col>
              <Input
                placeholder="Tìm kiếm theo tên khách hàng"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
            </Col>
          </Row>

          <Table
            columns={responsiveColumns}
            dataSource={filteredRequests}
            loading={initialLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
            style={{ overflowX: "hidden" }}
          />
        </>
      ) : (
        // Hiển thị component thiết kế tùy chỉnh
        <CustomDesignRequest />
      )}

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
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateStatusLoading}
            >
              Cập nhật trạng thái
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Tạo đơn hàng"
        open={editOrderModalVisible}
        onCancel={() => {
          setEditOrderModalVisible(false);
          editOrderForm.resetFields();
        }}
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
              { type: "number", min: 5000, message: "Giá tiền không được dưới 5 nghìn" },
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
            dependencies={['totalPrice']}
            rules={[
              { required: true, message: "Vui lòng nhập số tiền đặt cọc" },
              {
                type: "number",
                min: 5000,
                message: "Số tiền đặt cọc không được dưới 5 nghìn",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const totalPrice = getFieldValue('totalPrice');
                  if (!value || !totalPrice || value <= totalPrice) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Số tiền đặt cọc không được vượt quá tổng giá tiền'));
                },
              }),
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
            <Button
              type="primary"
              htmlType="submit"
              loading={createOrderLoading}
            >
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
