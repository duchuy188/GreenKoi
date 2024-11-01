import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input, Row, Col, Card } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined, HomeOutlined, UserAddOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../../config/axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/useSlice";
import { getAuth, signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../config/firebase";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import ReCAPTCHA from "react-google-recaptcha";
import './login.css';

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recaptchaRef = useRef(null);

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
      const recaptchaValue = recaptchaRef.current.getValue();
      if (!recaptchaValue) {
        toast.error("Vui lòng xác thực reCAPTCHA!");
        return;
      }

      const response = await api.post("/api/auth/login", {
        ...values,
        recaptchaToken: recaptchaValue
      });
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
          err.response.data.message === "Account is blocked"
        ) {
          toast.error(
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
          );
        } else if (err.response.data.message === "Account is blocked. Please contact the administrator.") {
          toast.error(
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
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
      // Reset reCAPTCHA after error
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-overlay"></div>
      <div className="auth-container">
        <div className="auth-form-container">
          {/* Phần bên trái - Hình ảnh */}
          <div className="auth-image-section">
            <div className="auth-image-content text-white">                        
            </div>
          </div>

          {/* Phần bên phi - Form đăng nhập */}
          <div className="auth-form-section">
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={handleLogin}
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập của bạn!" }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Tên đăng nhập" 
                  size="large"
                  className="auth-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu của bạn!" }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Mật khẩu" 
                  size="large"
                  className="auth-input"
                />
              </Form.Item>

              <Form.Item>
                <div className="recaptcha-container">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6Lc9km8qAAAAAAyctYyCl8BSTikQFuuVmWWeXg3f"
                    onChange={() => {}}
                  />
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" className="login-btn">
                  Đăng nhập
                </Button>
              </Form.Item>

              <div className="auth-links text-center mt-4">
                <Link to="/register" className="me-4 hover:text-primary">
                  <UserAddOutlined className="mr-1" />
                  Đăng ký tài khoản
                </Link>
                <Link to="/" className="hover:text-primary">
                  <HomeOutlined className="mr-1" />
                  Quay về trang chủ
                </Link>
              </div>

              <div className="divider">
                <span className="divider-text">Hoặc</span>
              </div>

              <Form.Item>
                <Button
                  block
                  size="large"
                  icon={<GoogleOutlined />}
                  onClick={handleLoginGoogle}
                  className="google-btn"
                >
                  Đăng nhập bằng Google
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
