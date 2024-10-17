import React, { useState, useEffect } from "react";
import api from '/src/components/config/axios';
import "./Profile.css";
import { Button, Form, Input, Modal, Table, Tabs, message } from 'antd';

// Tạo instance axios với interceptor
function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await api.get("/api/profile");

        console.log("Full API response:", response);

        if (response.data && typeof response.data === 'object' && !response.data.toString().includes('<!DOCTYPE html>')) {
          setProfileData(response.data);
        } else {
          console.error("Unexpected API response structure:", response);
          if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            setError("Received HTML instead of JSON. This might be due to an authentication issue or server error.");
          } else {
            setError("Unexpected API response structure. Please check the console for details.");
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        if (err.response) {
          console.error("Error response:", err.response);
          setError(`Error ${err.response.status}: ${err.response.data.message || err.response.statusText || "Unknown error"}`);
        } else if (err.request) {
          console.error("Error request:", err.request);
          setError("No response received from server");
        } else {
          setError(err.message || "An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchConsultationRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        // Sử dụng ID từ thông tin profile nếu có
        const customerId = profileData?.id || localStorage.getItem('customerId');
        if (!customerId) {
          throw new Error('No customer ID found');
        }

        const response = await api.get(`/api/ConsultationRequests/customer/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("Consultation requests:", response.data);
        setConsultationRequests(response.data);
      } catch (err) {
        console.error("Error fetching consultation requests:", err);
        message.error('Failed to load consultation requests');
      }
    };

    fetchProfileData();
    fetchConsultationRequests();
  }, []);

  const handleEdit = () => {
    form.setFieldsValue(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (values) => {
    try {
      const response = await api.put("/api/profile", values);
      setProfileData(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      // Handle error (e.g., show error message)
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profileData) return <div>No profile data available. Please try refreshing the page.</div>;


  const consultationColumns = [
    {
      title: 'Tên dự án',
      dataIndex: 'designName',
      key: 'designName',
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  const items = [
    {
      key: '1',
      label: 'Thông tin',
      children: (
        <div className="row">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6">
                <label>Họ và tên</label>
              </div>
              <div className="col-md-6">
                <p>{profileData.fullName}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label>Email</label>
              </div>
              <div className="col-md-6">
                <p>{profileData.email}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label>Số điện thoại</label>
              </div>
              <div className="col-md-6">
                <p>{profileData.phone}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label>Địa chỉ</label>
              </div>
              <div className="col-md-6">
                <p>{profileData.address}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Yêu cầu của tôi',
      children: (
        <div>
          <h3>Yêu cầu tư vấn của tôi</h3>
          <Table 
            dataSource={consultationRequests} 
            columns={consultationColumns} 
            rowKey="id"
          />
        </div>
      ),
    },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="profile-background">
      <div className="container emp-profile">
        <div className="row">
          <div className="col-md-10">
            <div className="profile-head">
              <h5>{profileData.fullName}</h5>
              <h6>{profileData.role}</h6>
              <p className="proile-rating">
                Số dự án đã đặt: <span>{profileData.projectCount || 0}</span>
              </p>
              <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
            </div>
          </div>
          <div className="col-md-2">
            <Button onClick={handleEdit} className="profile-edit-btn">
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Modal for editing profile */}
        <Modal
          visible={isEditing}
          title="Chỉnh sửa thông tin"
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={() => form.submit()}>
              Lưu
            </Button>,
          ]}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default Profile;
