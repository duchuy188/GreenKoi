import React from 'react' 
import AuthenTemplate from '../../authen-templated'
import { Button, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function LoginPage() {
  const navigate = useNavigate();
  const handlLoginGoogle = () => {
  
  };
  
  const handlLogin = async (values) => {
//api login
    try {
      const response = await api.post("login", values);
      console.log(response);
      const {role,token} = response.data;
      localStorage.setItem("token",token);

      if (role === "ADMIN"){
        navigate("/dashboard");
      }
      
    }catch(err) {
      toast.error(err.response.data)
    }
   
  };


  return (
  <AuthenTemplate>
    <Form
     labelCol={{
      span: 24,  
     }}
      onFinish={handlLogin}
    >
      
     <Form.Item label="Username" name="name" rules={[
      //phone or email backend lam casi nay api
      {
        required:true,
        message:"Please!",
      },
     ]}
     >
      <Input/>
     </Form.Item>
     <Form.Item label="Password" name="password" rules={[
      {
        required:true,
        message:"Please password!",
      },
     ]}
     >
      <Input.Password/>
     </Form.Item>

     <div>
     <Link to="/register">
     Create new account?
     </Link>
     </div>
     <Button type="primary" htmlType="submit">
      Login</Button>
     <Button onClick={handlLoginGoogle}>
      Login google
     </Button>
    </Form>
  </AuthenTemplate>
  );
  
}

export default LoginPage