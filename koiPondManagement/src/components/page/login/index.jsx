import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import api from '../../config/axios';
import AuthenTemplate from '../../authen-templated';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      const response = await api.post("/api/auth/login", values);
      
      if (response && response.data) {
        toast.success("Login Successful!");
        localStorage.setItem("token", response.data.token);
        navigate("/");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        toast.error(err.response.data.message || "Login failed. Please check your credentials.");
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
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input/>
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
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
          <Button type="default" block onClick={() => console.log("Google login not implemented")}>
            Login with Google
          </Button>
        </Form.Item>
      </Form>
    </AuthenTemplate>
  );
}

export default LoginPage;
