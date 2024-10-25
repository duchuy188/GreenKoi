import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "/src/components/config/axios";
import "./Profile.css";
import {
  Button,
  Form,
  Input,
  Modal,
  Table,
  Tabs,
  message,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm] = Form.useForm();

  // Get user information from Redux store
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProfileData();
      console.log("Profile data after fetch:", profileData);
      await fetchConsultationRequests();
    };

    fetchData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      let profileInfo = {};

      // Use data from Redux store if available
      if (user) {
        profileInfo = {
          id: user.id,
          fullName: user.name || user.username || user.email, // Add 'name' field for Google login
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "User",
          projectCount: user.projectCount || 0,
        };
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data && typeof response.data === "object") {
            console.log("Raw profile data:", response.data);
            // Kết hợp dữ liệu từ API với profileInfo
            profileInfo = { ...profileInfo, ...response.data };
          } else {
            throw new Error("Invalid profile data");
          }
        } catch (apiError) {
          console.error("Lỗi khi lấy hồ sơ từ API:", apiError);
        }
      }

      // Đảm bảo rằng id được lưu vào localStorage
      if (profileInfo.id) {
        localStorage.setItem("customerId", profileInfo.id);
      }

      console.log("Final profile info:", profileInfo);
      setProfileData(profileInfo);

      // Set form fields with profile data
      form.setFieldsValue(profileInfo);
    } catch (err) {
      console.error("Error in fetchProfileData:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultationRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Sử dụng ID từ thông tin profile nếu có
      const customerId = profileData?.id || localStorage.getItem("customerId");
      if (!customerId) {
        throw new Error("No customer ID found");
      }

      const response = await api.get(
        `/api/ConsultationRequests/customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Consultation requests:", response.data);
      setConsultationRequests(response.data);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm yêu cầu tư vấn:", err);
      message.error("Không tải được yêu cầu tư vấn");
    }
  };
  const handleEditInfo = () => {
    form.setFieldsValue(profileData);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/ConsultationRequests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Yêu cầu đã được xóa thành công");
      fetchConsultationRequests(); // Refresh the list
    } catch (err) {
      console.error("Lỗi khi xóa yêu cầu tư vấn:", err);
      message.error("Không thể xóa yêu cầu tư vấn");
    }
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record);
    setEditingRequest(record);
    editForm.setFieldsValue({
      designName: record.designName,
      notes: record.notes,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      customerAddress: record.customerAddress,
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/api/ConsultationRequests/${editingRequest.id}`,
        {
          ...editingRequest,
          ...values,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Yêu cầu đã được cập nhật thành công");
        setEditingRequest(null);
        fetchConsultationRequests(); // Refresh the list
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật yêu cầu tư vấn:", err);
      message.error("Không thể cập nhật yêu cầu tư vấn");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put("/api/profile", values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setProfileData(response.data);
        setIsEditing(false);
        message.success("Thông tin đã được cập nhật thành công");
        fetchProfileData(); // Refresh profile data
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      message.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    form.setFieldsValue({ phone: value });
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!profileData)
    return (
      <div>
        Không có dữ liệu hồ sơ nào khả dụng. Vui lòng thử làm mới trang.
      </div>
    );

  const consultationColumns = [
    {
      title: "Tên dự án",
      dataIndex: "designName",
      key: "designName",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === "PENDING" ? (
          <span>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ marginRight: "10px" }}
            >
              Chỉnh sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa yêu cầu này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger>
                Xóa
              </Button>
            </Popconfirm>
          </span>
        ) : null,
    },
  ];

  return (
    <div className="profile-background">
      <div className="container emp-profile">
        <div className="row">
          <div className="col-lg-4 pb-5">
            <div className="author-card pb-3">
              <div className="author-card-cover"></div>
              <div className="author-card-profile">
                <div className="author-card-avatar">
                  <img
                    src={
                      user?.picture ||
                      "https://bootdey.com/img/Content/avatar/avatar1.png"
                    }
                    alt={profileData?.fullName}
                  />
                </div>
                <div className="author-card-details">
                  <h5 className="author-card-name">
                    {profileData?.fullName ||
                      user?.name ||
                      user?.username ||
                      user?.email}
                  </h5>
                  <span className="author-card-position">
                    Joined{" "}
                    {new Date(
                      profileData?.createdAt || user?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="wizard">
              <nav className="list-group list-group-flush">
                <a
                  className={`list-group-item ${
                    activeTab === "1" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("1")}
                >
                  <UserOutlined className="mr-1" />
                  <div className="d-inline-block font-weight-medium text-uppercase">
                    Cài đặt hồ sơ
                  </div>
                </a>
                <a
                  className={`list-group-item ${
                    activeTab === "2" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("2")}
                >
                  <ShoppingOutlined className="mr-1" />
                  <div className="d-inline-block font-weight-medium text-uppercase">
                    Yêu cầu của tôi
                  </div>
                </a>
              </nav>
            </div>
          </div>
          <div className="col-lg-8 pb-5">
            {activeTab === "1" && (
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  name="fullName"
                  label="Họ và Tên"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    {
                      required: true,
                      message: "Please input your phone number!",
                    },
                    {
                      max: 10,
                      message: "Phone number cannot be longer than 10 digits",
                    },
                    {
                      pattern: /^[0-9]*$/,
                      message: "Phone number can only contain digits",
                    },
                  ]}
                >
                  <Input maxLength={10} onChange={handlePhoneChange} />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Cập nhật hồ sơ
                  </Button>
                </Form.Item>
              </Form>
            )}

            {activeTab === "2" && (
              <div>
                <h3>Yêu cầu tư vấn của tôi</h3>
                <Table
                  dataSource={consultationRequests}
                  columns={consultationColumns}
                  rowKey="id"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        title="Chỉnh sửa yêu cầu tư vấn"
        visible={!!editingRequest}
        onCancel={() => setEditingRequest(null)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEditSubmit} layout="vertical">
          <Form.Item
            name="designName"
            label="Tên dự án"
            rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="customerName" label="Tên khách hàng">
            <Input />
          </Form.Item>
          <Form.Item name="customerPhone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="customerAddress" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Profile;
