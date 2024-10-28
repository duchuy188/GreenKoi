import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input, Row, Col, Card } from "antd";
import { toast } from "react-toastify";
import api from "../../config/axios";

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
    <Row className="min-h-screen">
      {/* Left section - Image (2/3) */}
      <Col xs={0} sm={0} md={16} style={{ height: "100vh" }}>
        <img
          src="img\images3.jpg"
          alt="Register"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Col>

      {/* Right section - Register Form (1/3) */}
      <Col xs={24} sm={24} md={8} style={{ height: "100vh" }}>
        <div
          style={{
            height: "100%",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Card
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                textAlign: "center",
                fontSize: "24px",
                margin: "0 0 24px 0",
              }}
            >
              Đăng ký
            </h1>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 4px",
              }}
            >
              <Form
                name="register"
                onFinish={handleRegister}
                layout="vertical"
                size="large"
                style={{ paddingRight: "8px" }}
              >
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên đăng nhập!",
                    },
                  ]}
                >
                  <Input placeholder="Tên đăng nhập" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu!",
                    },
                    {
                      min: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự!",
                    },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận mật khẩu!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Hai mật khẩu không khớp nhau!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Nhập lại mật khẩu" />
                </Form.Item>

                <Form.Item
                  name="fullName"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ và tên!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại!",
                    },
                    {
                      pattern: /^[0-9]{10}$/, // Chỉ cho phép 10 chữ số
                      message: "Số điện thoại phải chứa đúng 10 chữ số!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập email!",
                    },
                    {
                      type: "email",
                      message: "Vui lòng nhập địa chỉ email hợp lệ!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Đăng ký
                  </Button>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                  <Link to="/login">
                    Bạn đã có tài khoản? Đăng nhập tại đây
                  </Link>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
  );
}

export default RegisterPage;
