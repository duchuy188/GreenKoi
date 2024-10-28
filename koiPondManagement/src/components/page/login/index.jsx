import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input, Row, Col, Card } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../../config/axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/useSlice";
import { getAuth, signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../config/firebase";
import { GoogleAuthProvider } from "firebase/auth/web-extension";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginGoogle = () => {
    const auth = getAuth();
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;

        const userInfo = {
          uid: user.uid,
          username: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };

        console.log("Đăng nhập Google thành công", userInfo);
        toast.success("Đăng nhập Google thành công!");

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userInfo));
        dispatch(login(userInfo));
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Lỗi đăng nhập Google", error);
        toast.error(`Đăng nhập Google không thành công: ${error.message}`);
      });
  };

  const handleLogin = async (values) => {
    try {
      const response = await api.post("/api/auth/login", values);
      const { token, roleId, ...userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ ...userData, roleId }));
      dispatch(login({ ...userData, roleId }));

      toast.success("Đăng nhập thành công!");

      const role = parseInt(roleId);
      if (role >= 1 && role <= 4) {
        navigate("/dashboard");
      } else if (role === 5) {
        navigate("/");
      } else {
        toast.error(
          "Vai trò không hợp lệ. Vui lòng liên hệ với người quản trị."
        );
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.response) {
        if (
          err.response.status === false &&
          err.response.data.message === "Tài khoản bị chặn"
        ) {
          toast.error(
            "Tài khoản của bạn đã bị chặn. Vui lòng liên hệ với quản trị viên."
          );
        } else if (err.response.data.message === "Authentication failed: Incorrect password") {
          toast.error("Vui lòng kiểm tra tên tài khoản, mật khẩu");
        } else {
          toast.error(
            err.response.data.message ||
              "Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập của bạn."
          );
        }
      } else if (err.request) {
        toast.error("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
      } else {
        toast.error("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Row className="min-h-screen">
      {/* Left section - Image (2/3) */}
      <Col xs={0} sm={0} md={16} style={{ height: "100vh" }}>
        <img
          src="img\images3.jpg"
          alt="Login"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Col>

      {/* Right section - Login Form (1/3) */}
      <Col xs={24} sm={24} md={8}>
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <Card>
            <h1
              style={{
                textAlign: "center",
                fontSize: "24px",
                marginBottom: "24px",
              }}
            >
              Đăng nhập
            </h1>

            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={handleLogin}
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên đăng nhập của bạn!",
                  },
                ]}
              >
                <Input placeholder="Tên đăng nhập" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu của bạn!",
                  },
                ]}
              >
                <Input.Password placeholder="Mật khẩu" size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Đăng nhập
                </Button>
              </Form.Item>

              <Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                  }}
                >
                  <Link to="/register">Đăng ký tài khoản</Link>
                  <Link to="/">Quay Về trang chủ</Link>
                </div>
              </Form.Item>

              <div
                style={{
                  position: "relative",
                  textAlign: "center",
                  margin: "16px 0",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#fff",
                    padding: "0 8px",
                    color: "#999",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Hoặc
                </span>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "50%",
                    height: 1,
                    backgroundColor: "#f0f0f0",
                    zIndex: 0,
                  }}
                />
              </div>

              <Form.Item>
                <Button
                  block
                  size="large"
                  icon={<GoogleOutlined />}
                  onClick={handleLoginGoogle}
                >
                  Đăng nhập bằng Google
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Col>
    </Row>
  );
}

export default LoginPage;
