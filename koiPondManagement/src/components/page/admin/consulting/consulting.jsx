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
} from "antd";
import { FaEdit, FaShoppingCart } from "react-icons/fa";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import moment from "moment";

const Consulting = () => {
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchConsultationRequests();
  }, []);

  useEffect(() => {
    const filtered = consultationRequests.filter((request) =>
      Object.values(request).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredRequests(filtered);
  }, [searchText, consultationRequests]);

  const fetchConsultationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/ConsultationRequests");
      console.log("Raw consultation requests:", response.data);
      if (Array.isArray(response.data)) {
        const requests = response.data.map((request) => {
          console.log("Individual request:", request);
          return request;
        });
        setConsultationRequests(requests);
      } else if (response.data.consultationRequests) {
        setConsultationRequests(response.data.consultationRequests);
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
      message.success("Status updated successfully");
      setEditModalVisible(false);
      await fetchConsultationRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = (record) => {
    console.log("Full record for creating order:", record);

    if (!record.customerId) {
      console.error("Missing customerId in record:", record);
      message.error("Customer ID is missing. Cannot create order.");
      return;
    }

    Modal.confirm({
      title: "Create Order",
      content: `Are you sure you want to create an order for ${record.customerName}?`,
      onOk: () => createOrder(record),
    });
  };

  const createOrder = async (record) => {
    try {
      setLoading(true);

      // Kiểm tra chi tiết hơn và log ra các trường bị thiếu
      const requiredFields = [
        "customerName",
        "customerPhone",
        "customerAddress",
        "designId",
        "customerId",
      ];
      const missingFields = requiredFields.filter((field) => !record[field]);

      if (missingFields.length > 0) {
        console.error("Missing fields:", missingFields);
        throw new Error(
          `Missing required information: ${missingFields.join(", ")}`
        );
      }

      const projectData = {
        name: `Project for ${record.customerName}`,
        description:
          record.designDescription || "Thiết kế hồ cá Koi phong cách hiện đại",
        totalPrice: 0, // Bạn có thể muốn đặt giá trị mặc định hoặc tính toán
        depositAmount: 0, // Bạn có thể muốn đặt giá trị mặc định hoặc tính toán
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().add(30, "days").format("YYYY-MM-DD"),
        designId: record.designId,
        promotionId: null, // Bạn có thể muốn xử lý khác
        address: record.customerAddress,
        customerId: record.customerId,
        consultantId: record.consultantId || null,
      };

      console.log("Project data being sent:", projectData);

      const response = await api.post("/api/projects", projectData);
      if (response.data) {
        message.success("Order created successfully");
        await fetchConsultationRequests();
        // Cập nhật trạng thái yêu cầu tư vấn thành COMPLETED
        await updateConsultationStatus(record.id, "COMPLETED");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      message.error(
        "Failed to create order: " +
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
    } catch (error) {
      console.error("Error updating consultation status:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Customer Phone",
      dataIndex: "customerPhone",
      key: "customerPhone",
    },
    {
      title: "Customer Address",
      dataIndex: "customerAddress",
      key: "customerAddress",
    },
    {
      title: "Customer ID",
      dataIndex: "customerId",
      key: "customerId",
    },
    {
      title: "Design Name",
      dataIndex: "designName",
      key: "designName",
    },
    {
      title: "Design Description",
      dataIndex: "designDescription",
      key: "designDescription",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <FaEdit
            onClick={() => handleEditStatus(record)}
            style={{ cursor: "pointer", fontSize: "18px" }}
            title="Update Status"
          />
          {record.status === "IN_PROGRESS" && (
            <FaShoppingCart
              onClick={() => handleCreateOrder(record)}
              style={{ cursor: "pointer", fontSize: "18px", color: "#1890ff" }}
              title="Create Order"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Consultation Requests</h1>
      <Input.Search
        placeholder="Search requests"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredRequests}
        loading={loading}
        rowKey="id"
      />
      <Modal
        title="Update Status"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateStatus}>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Status
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Consulting;
