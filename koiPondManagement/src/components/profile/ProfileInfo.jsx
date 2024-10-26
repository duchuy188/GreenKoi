import React from "react";
import { Form, Input, Button, message } from "antd";
import api from "/src/components/config/axios";

function ProfileInfo({ profileData, setProfileData }) {
  const [form] = Form.useForm();

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
        message.success("Thông tin đã được cập nhật thành công");
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

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={profileData}>
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
  );
}

export default ProfileInfo;
