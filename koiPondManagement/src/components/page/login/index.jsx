import React from 'react' 
import AuthenTemplate from '../../authen-templated'
import { Button, Form, Input } from 'antd';
import { Link } from 'react-router-dom';

function LoginPage() {
  const handlLoginGoogle = () => {
    
  };
  
  const handlLogin = () => {
   
  };


  return (
  <AuthenTemplate>
    <Form
     labelCol={{
      span: 24,  
     }}
      
    >
     <Form.Item label="Username" name="username" rules={[
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
     <Button>Login</Button>
     <Button onClick={handlLoginGoogle}>
      Login google
     </Button>
    </Form>
  </AuthenTemplate>
  );
  
}

export default LoginPage