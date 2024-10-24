import React, { useState, useEffect } from "react";
import api from '/src/components/config/axios';
import { Card, Avatar, Typography, Spin, message, Button, Form, Input, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function InfoProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/profile");
        console.log("Full API response:", response);

        if (response.data && typeof response.data === 'object') {
          setProfileData(response.data);
        } else {
          setError("Unexpected API response structure. Please check the console for details.");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.response?.data?.message || err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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
      message.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      console.error("Error updating profile:", err);
      message.error('Cập nhật hồ sơ thất bại');
    }
  };

  const getAvatarContent = () => {
    if (profileData.avatar) {
      return <Avatar size={128} src={profileData.avatar} />;
    }
    const firstLetter = profileData.username ? profileData.username.charAt(0).toUpperCase() : 'U';
    return (
      <Avatar size={128} style={{ backgroundColor: '#f56a00', fontSize: '64px' }}>
        {firstLetter}
      </Avatar>
    );
  };

  if (loading) return <Spin size="large" />;
  if (error) return <div>Error: {error}</div>;
  if (!profileData) return <div>No profile data available. Please try refreshing the page.</div>;

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {getAvatarContent()}
        <Title level={2} style={{ marginTop: 16 }}>{profileData.fullName}</Title>
        <Text>{profileData.role}</Text>
      </div>
      <div>
        <Text strong>ID: </Text>
        <Text>{profileData.id}</Text>
      </div>
      <div>
        <Text strong>Username: </Text>
        <Text>{profileData.username}</Text>
      </div>
      <div>
        <Text strong>Email: </Text>
        <Text>{profileData.email}</Text>
      </div>
      <div>
        <Text strong>Phone: </Text>
        <Text>{profileData.phone}</Text>
      </div>
      <div>
        <Text strong>Role ID: </Text>
        <Text>{profileData.roleId}</Text>
      </div>
      <div>
        <Text strong>Address: </Text>
        <Text>{profileData.address}</Text>
      </div>
      <Button onClick={handleEdit} style={{ marginTop: 16 }}>
        Edit Profile
      </Button>

      <Modal
        open={isEditing}
        title="Edit Profile"
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Save
          </Button>,
        ]}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default InfoProfile;
