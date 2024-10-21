import { Link, useNavigate } from 'react-router-dom';
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
    <div>
      <h1>Đăng ký</h1>
      <Form
        labelCol={{
          span: 24,
        }}
        onFinish={handleRegister}
      >
        <Form.Item
          // label="Tên Đăng Nhập"
          name="username"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập tên đăng nhập!',
            },
          ]}
        >
          <Input placeholder='Tên đăng nhập'/>
        </Form.Item>

        <Form.Item
          // label="Mật Khẩu"
          name="password"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mật khẩu!',
            },
            {
              min: 6,
              message: 'Mật khẩu phải có ít nhất 6 ký tự!',
            },
          ]}
        >
          <Input.Password placeholder='Nhập mật khẩu '/>
        </Form.Item>

        <Form.Item
          // label="Nhập lại mật khẩu"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Vui lòng xác nhận mật khẩu!',
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
          <Input.Password placeholder='Nhập lại mật khẩu '/>
        </Form.Item>

        <Form.Item
          // label="Họ và tên "
          name="fullName"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập họ và tên !',
            },
          ]}
        >
          <Input placeholder='Nhập họ và tên '/>
        </Form.Item>

        <Form.Item
          //  label="Số điện thoại"
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập số điện thoại !',
            },
            {
              pattern: /^[0-9]+$/,
              message: 'Số điện thoại chỉ được chứa chữ số!',
            },
          ]}
        >
        <Input placeholder='Nhập số điện thoại '/>
        </Form.Item>

        <Form.Item
          // label="E-mail"
          name="email"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập email!',
            },
            {
              type: 'email',
              message: 'Vui lòng nhập địa chỉ email hợp lệ!',
            },
          ]}
        >
          <Input placeholder='Nhập email '/>
        </Form.Item>

        <Form.Item
          // label="Địa chỉ"
          name="address"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập địa chỉ!',
            },
          ]}
        >
          <Input placeholder='Nhập địa chỉ ' />
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
    </div>
  );
}

export default RegisterPage;