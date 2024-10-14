import { Link, useNavigate } from 'react-router-dom';
import AuthenTemplate from '../../authen-templated';
import { Button, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import api from '../../config/axios';

function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    try {
      // Loại bỏ confirmPassword vì backend không cần nó
      const { confirmPassword, ...registerData } = values;
      const response = await api.post("/api/auth/register", registerData);
      toast.success("Đăng ký thành công!");
      // Chuyển hướng người dùng đến trang đăng nhập sau khi đăng ký thành công
      navigate("/login");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      toast.error(err.response?.data?.message || "Đăng ký không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <AuthenTemplate>
      <Form
        labelCol={{
          span: 24,
        }}
        onFinish={handleRegister}
      >
        <Form.Item
          label="Tên Đăng Nhập"
          name="username"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập tên đăng nhập của bạn!',
            },
          ]}
        >
          <Input/>
        </Form.Item>

        <Form.Item
          label="Mật Khẩu"
          name="password"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu của bạn!',
            },
            {
              min: 6,
              message: 'Mật khẩu phải có ít nhất 6 ký tự!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Vui lòng xác nhận mật khẩu của bạn!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Hai mật khẩu không khớp nhau!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Họ và tên đầy đủ"
          name="fullName"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập tên đầy đủ của bạn!',
            },
          ]}
        >
          <Input/>
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập số điện thoại của bạn!',
            },
            {
              pattern: /^[0-9]+$/,
              message: 'Số điện thoại chỉ được chứa chữ số!',
            },
          ]}
        >
        <Input/>
        </Form.Item>

        <Form.Item
          label="E-mail"
          name="email"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập email của bạn!',
            },
            {
              type: 'email',
              message: 'Vui lòng nhập địa chỉ email hợp lệ!',
            },
          ]}
        >
          <Input/>
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập địa chỉ của bạn!',
            },
          ]}
        >
          <Input/>
        </Form.Item>

        <Form.Item>
          <Link to="/login">Bạn đã có tài khoản? Đăng nhập tại đây</Link>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </AuthenTemplate>
  );
}

export default RegisterPage;