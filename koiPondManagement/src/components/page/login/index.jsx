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

        console.log("Google login successful", user);
        toast.success("Google login successful!");
        // TODO: Handle successful login (e.g., update Redux state, navigate to dashboard)
      }).catch((error) => {
        console.error("Google login error", error);
        toast.error(`Google login failed: ${error.message}`);
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
      
      toast.success("Login Successful!");

      // Phân quyền dựa trên roleId
      const role = parseInt(roleId);
      if (role >= 1 && role <= 4) {
        navigate("/dashboard");
      } else if (role === 5) {
        navigate("/"); // Chuyển đến trang chủ
      } else {
        toast.error("Invalid role. Please contact administrator.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        if (
          err.response.status === false &&
          err.response.data.message === "Account blocked"
        ) {
          toast.error(
            "Your account has been blocked. Please contact the administrator."
          );
        } else {
          toast.error(
            err.response.data.message ||
              "Login failed. Please check your credentials."
          );
        }
      } else if (err.request) {
        toast.error("Unable to connect to the server. Please try again later.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
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
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input/>
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>

        <Form.Item>
          <Link to="/register">Create new account?</Link>
        </Form.Item>

        <Form.Item>
          <Button
            type="default"
            block
            // onClick={() => console.log("Google login not implemented")}
            onClick={handleLoginGoogle}
          >
            Login with Google
          </Button>
        </Form.Item>
      </Form>
    </AuthenTemplate>
  );
}

export default LoginPage;
