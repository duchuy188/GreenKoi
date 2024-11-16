import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined, HomeOutlined, UserAddOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../../config/axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/useSlice";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Chỉ import một lần
import { googleProvider } from "../../config/firebase";
import ReCAPTCHA from "react-google-recaptcha";
import './login.css';

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recaptchaRef = useRef(null);

// Sửa lại hàm handleLoginGoogle
const handleLoginGoogle = async () => {
  try {
    const auth = getAuth();
    console.log("Starting Google login flow...");
    
    // Thêm options cho Google Sign In
    googleProvider.setCustomParameters({
      prompt: 'select_account' // Luôn hiện dialog chọn account
    });
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google popup login successful");
    
    // Lấy token từ Google result
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const firebaseToken = await result.user.getIdToken();
    
    console.log("Google User Info:", {
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid
    });
    
    // Gọi API backend
    const response = await api.post("/api/auth/google", null, {
      headers: {
        Authorization: `Bearer ${firebaseToken}`
      }
    });
    
    // Xử lý response từ backend
    const { token, roleId, email, fullName, isNewUser, ...userData } = response.data;
    
    // Lưu thông tin vào localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ 
      ...userData, 
      roleId,
      email: email || result.user.email, // Fallback to Google email
      fullName: fullName || result.user.displayName // Fallback to Google name
    }));
    
    // Dispatch action để cập nhật Redux store
    dispatch(login({ 
      ...userData, 
      roleId,
      email: email || result.user.email,
      fullName: fullName || result.user.displayName
    }));

    // Thông báo thành công
    if (isNewUser) {
      toast.success("Tài khoản mới đã được tạo thành công!");
    } else {
      toast.success("Đăng nhập Google thành công!");
    }

    // Điều hướng dựa vào role
    const role = parseInt(roleId);
    if (role >= 1 && role <= 4) {
      navigate("/dashboard");
    } else if (role === 5) {
      navigate("/");
    } else {
      toast.error("Vai trò không hợp lệ. Vui lòng liên hệ với người quản trị.");
    }

  } catch (error) {
    console.error("Full error object:", error);
    
    if (error.code) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          toast.info("Đăng nhập đã bị hủy"); // Đổi thành info thay vì error
          break;
        case 'auth/cancelled-popup-request':
          // Không cần thông báo
          break;
        case 'auth/popup-blocked':
          toast.error("Popup bị chặn. Vui lòng cho phép popup và thử lại.");
          break;
        case 'auth/account-exists-with-different-credential':
          toast.error("Email này đã được sử dụng với phương thức đăng nhập khác.");
          break;
        default:
          toast.error("Lỗi xác thực: " + error.message);
      }
      return;
    }

    if (error.response) {
      const errorMessage = error.response.data.message;
      if (errorMessage.includes("blocked")) {
        toast.error("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
      } else {
        toast.error(errorMessage || "Đăng nhập thất bại");
      }
    } else if (error.request) {
      toast.error("Không thể kết nối đến máy chủ");
    } else {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  }
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

              { <div className="divider">
                <span className="divider-text">Hoặc</span>
              </div> }

              { <Form.Item>
                <Button
                  block
                  size="large"
                  icon={<GoogleOutlined />}
                  onClick={handleLoginGoogle}
                  className="google-btn"
                >
                  Đăng nhập bằng Google
                </Button>
              </Form.Item> }
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
