import React from "react";
import { Form, Input, Button } from "antd";
import { toast } from "react-toastify";
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
        toast.success("Thông tin đã được cập nhật thành công");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    form.setFieldsValue({ phone: value });
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      initialValues={profileData}
    >
      <Form.Item
        name="fullName"
        label="Họ và Tên"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Vui lòng nhập email" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập số điện thoại của bạn!",
          },
          {
            len: 10, // Sử dụng 'len' để bắt buộc nhập đúng 10 chữ số
            message: "Số điện thoại phải đúng 10 chữ số",
          },
          {
            pattern: /^[0-9]*$/,
            message: "Số điện thoại chỉ có thể chứa chữ số",
          },
        ]}
      >
        <Input maxLength={10} onChange={handlePhoneChange} />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
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
