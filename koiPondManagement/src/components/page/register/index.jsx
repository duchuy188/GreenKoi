import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input, Row, Col, Card } from "antd";
import { toast } from "react-toastify";
import api from "../../config/axios";
import './register.css';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, HomeOutlined, IdcardOutlined } from "@ant-design/icons";

function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    try {
      const { confirmPassword, ...registerData } = values;
      const response = await api.post("/api/auth/register", registerData);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      toast.error(
        err.response?.data?.message ||
          "Đăng ký không thành công. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="signup-background">
      <div className="signup-overlay"></div>
      <div className="signup-container">
        <div className="signup-form-container">
          <div className="signup-form-section">
            <Form
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item name="username" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
                <Input 
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Tên đăng nhập" 
                  className="signup-input"
                />
              </Form.Item>

              <Form.Item name="password" rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
              ]}>
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Mật khẩu"
                  className="signup-input"
                />
              </Form.Item>

              <Form.Item name="confirmPassword" dependencies={["password"]} rules={[/* giữ nguyên rules */]}>
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Xác nhận mật khẩu"
                  className="signup-input"
                />
              </Form.Item>

              <Form.Item name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
                <Input 
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="Họ và tên"
                  className="signup-input"
                />
              </Form.Item>

              <Form.Item 
                name="phoneNumber" 
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { 
                    pattern: /^[0-9]{10}$/, 
                    message: "Số điện thoại phải có đúng 10 chữ số!" 
                  }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="Số điện thoại"
                  className="signup-input"
                />
              </Form.Item>

              <Form.Item name="email" rules={[/* giữ nguyên rules */]}>
                <Input 
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email"
                  className="signup-input"
                />
              </Form.Item>

              <Form.Item name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
                <Input 
                  prefix={<HomeOutlined className="text-gray-400" />}
                  placeholder="Địa chỉ"
                  className="signup-input"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  className="signup-btn"
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <div className="signup-links text-center mt-4">
                <Link to="/login" className="text-white hover:text-blue-400">
                  Đã có tài khoản? Đăng nhập tại đây
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
