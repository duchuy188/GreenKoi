import React, { useState, useEffect } from "react";
import api from '/src/components/config/axios';
import { Card, Avatar, Typography, Spin, message, Button, Form, Input, Modal } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, EditOutlined, SaveOutlined, CloseOutlined, TeamOutlined } from '@ant-design/icons';

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
  if (error) return <div>Lỗi: {error}</div>;
  if (!profileData) return <div>Không có dữ liệu hồ sơ. Vui lòng tải lại trang.</div>;

  return (
    <Card style={{ 
      maxWidth: 800, 
      margin: '24px auto',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ 
        textAlign: 'center', 
        background: 'linear-gradient(to right, #1890ff, #096dd9)',
        margin: '-24px -24px 24px -24px',
        padding: '32px 24px',
        borderRadius: '12px 12px 0 0',
        color: 'white'
      }}>
        {getAvatarContent()}
        <Title level={2} style={{ 
          marginTop: 16, 
          marginBottom: 4,
          color: 'white'
        }}>{profileData.fullName}</Title>
        <Text style={{ 
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.85)'
        }}>{profileData.role}</Text>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        padding: '0 16px',
        marginBottom: 24
      }}>
        {[
          { icon: <UserOutlined />, label: 'ID', value: profileData.id },
          { icon: <UserOutlined />, label: 'Tên đăng nhập', value: profileData.username },
          { icon: <MailOutlined />, label: 'Email', value: profileData.email },
          { icon: <PhoneOutlined />, label: 'Số điện thoại', value: profileData.phone },
          { icon: <TeamOutlined />, label: 'Role ID', value: profileData.roleId },
          { icon: <HomeOutlined />, label: 'Địa chỉ', value: profileData.address }
        ].map((item, index) => (
          <div key={index} style={{
            padding: '12px 16px',
            background: '#f5f5f5',
            borderRadius: 8,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              color: '#1890ff',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {item.icon}
            </span>
            <div>
              <Text strong style={{ 
                display: 'block',
                color: '#1890ff',
                marginBottom: 4
              }}>{item.label}</Text>
              <Text>{item.value}</Text>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        paddingTop: 24
      }}>
        <Button 
          type="primary"
          onClick={handleEdit} 
          icon={<EditOutlined />}
          style={{ 
            height: 40,
            padding: '0 32px',
            fontSize: '16px',
            borderRadius: 6,
            background: '#1890ff',
            border: 'none',
            boxShadow: '0 2px 4px rgba(24,144,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Chỉnh sửa hồ sơ
        </Button>
      </div>

      <Modal
        open={isEditing}
        title={
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 600,
            color: '#2F54EB',
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px',
            margin: '-20px -24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <EditOutlined style={{ fontSize: '24px' }} />
            Chỉnh sửa hồ sơ
          </div>
        }
        onCancel={handleCancel}
        width={600}
        style={{ top: 20 }}
        footer={
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'  // Khoảng cách giữa 2 nút
          }}>
            <Button 
              key="cancel" 
              onClick={handleCancel} 
              size="large"
              icon={<CloseOutlined />}
              style={{ 
                borderRadius: 6,
                padding: '0 24px',
                height: 40,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Hủy
            </Button>
            <Button 
              key="submit" 
              type="primary" 
              onClick={() => form.submit()} 
              size="large"
              icon={<SaveOutlined />}
              style={{ 
                borderRadius: 6,
                padding: '0 24px',
                height: 40,
                background: '#2F54EB',
                border: 'none',
                boxShadow: '0 2px 4px rgba(47,84,235,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Lưu
            </Button>
          </div>
        }
      >
        <Form 
          form={form} 
          onFinish={handleSubmit} 
          layout="vertical"
          style={{ padding: '0 16px' }}
        >
          <Form.Item 
            name="fullName" 
            label={<span style={{ fontSize: '16px' }}>Họ và tên</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#2F54EB' }} />}
              size="large"
              style={{ 
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '16px'
              }} 
            />
          </Form.Item>
          <Form.Item 
            name="email" 
            label={<span style={{ fontSize: '16px' }}>Thư điện tử</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: '#2F54EB' }} />}
              size="large"
              style={{ 
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '16px'
              }} 
            />
          </Form.Item>
          <Form.Item 
            name="phone" 
            label={<span style={{ fontSize: '16px' }}>Số điện thoại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input 
              prefix={<PhoneOutlined style={{ color: '#2F54EB' }} />}
              size="large"
              style={{ 
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '16px'
              }} 
            />
          </Form.Item>
          <Form.Item 
            name="address" 
            label={<span style={{ fontSize: '16px' }}>Địa chỉ</span>}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input 
              prefix={<HomeOutlined style={{ color: '#2F54EB' }} />}
              size="large"
              style={{ 
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '16px'
              }} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default InfoProfile;
