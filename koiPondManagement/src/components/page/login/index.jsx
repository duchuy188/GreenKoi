import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { toast } from "react-toastify";
import api from "../../config/axios";
import AuthenTemplate from "../../authen-templated";
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

        // Chỉ lưu trữ các giá trị có thể serialize
        const userInfo = {
          uid: user.uid,
          username: user.displayName, // Sử dụng displayName làm username
          email: user.email,
          photoURL: user.photoURL,
        };

        console.log("Đăng nhập Google thành công", userInfo);
        toast.success("Đăng nhập Google thành công!");

        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userInfo));
        
        // Dispatch action login với thông tin người dùng
        dispatch(login(userInfo));

        // Chuyển hướng đến trang dashboard
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
      console.log(response);
      const { token, roleId, ...userData } = response.data;

      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ ...userData, roleId })); // Lưu cả roleId
      dispatch(login({ ...userData, roleId })); // Cập nhật Redux state
      
      toast.success("Đăng nhập thành công!");

      // Phân quyền dựa trên roleId
      const role = parseInt(roleId);
      if (role >= 1 && role <= 4) {
        navigate("/dashboard");
      } else if (role === 5) {
        navigate("/"); // Chuyển đến trang chủ
      } else {
        toast.error("Vai trò không hợp lệ. Vui lòng liên hệ với người quản trị.");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.response) {
        if (
          err.response.status === false &&
          err.response.data.message === "Tài khoản bị chặn"
        ) {
          toast.error("Tài khoản của bạn đã bị chặn. Vui lòng liên hệ với quản trị viên.");
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
    <AuthenTemplate>
      <h1>Đăng nhập</h1>
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
          <Input placeholder='Tên đăng nhập'/>
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu của bạn!" }]}
        >
          <Input.Password placeholder='Mật khẩu'/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form.Item>

        <Form.Item>
          <Link to="/register">Đăng ký tài khoản</Link>
        </Form.Item>

        <Form.Item>
          <Button
            type="default"
            block
            onClick={handleLoginGoogle}
          >
            Đăng nhập bằng Google
          </Button>
        </Form.Item>
      </Form>
    </AuthenTemplate>
  );
}

export default LoginPage;
