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
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        console.log("Đăng nhập Google thành công", user);
        toast.success("Đăng nhập Google thành công!");
        // TODO: Handle successful login (e.g., update Redux state, navigate to dashboard)
      }).catch((error) => {
        console.error("Lỗi đăng nhập Google", error);
        toast.error(`Đăng nhập Google không thành công: ${error.message}`);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData?.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }
  

  const handleLogin = async (values) => {
    try {
      const response = await api.post("/api/auth/login", values);
      console.log(response);
      const { token, roleId, ...userData } = response.data;
      localStorage.setItem("token", token);
      
      // Dispatch only serializable data
      dispatch(login(userData));
      
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
          toast.error(
            "Tài khoản của bạn đã bị chặn. Vui lòng liên hệ với quản trị viên."
          );
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
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          label="Tên Đăng Nhập"
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập của bạn!" }]}
        >
          <Input/>
        </Form.Item>

        <Form.Item
          label="Mật Khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu của bạn!" }]}
        >
          <Input.Password />
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
            // onClick={() => console.log("Google login not implemented")}
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
