
import { Link } from 'react-router-dom';
import AuthenTemplate from '../../authen-templated';
import { Form, Input } from 'antd';

function RegisterPage() {
  return (
    <AuthenTemplate>
    <Form
  labelCol={{
    span: 24,
  }}
>
  <Form.Item
    label="Username"
    name="username"
    rules={[
      {
        required: true,
        message: 'Please input your username!',
      },
    ]}
  >
    <Input/>
  </Form.Item>

  <Form.Item
    label="Password"
    name="password"
    rules={[
      {
        required: true,
        message: 'Please input your password!',
      },
      {
        min: 6,
        message: 'Password must be at least 6 characters!',
      },
    ]}
  >
    <Input.Password />
  </Form.Item>

  <Form.Item
    label="Re-enter Password"
    name="confirmPassword"
    dependencies={['password']}
    rules={[
      {
        required: true,
        message: 'Please confirm your password!',
      },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('The two passwords do not match!'));
        },
      }),
    ]}
  >
    <Input.Password />
  </Form.Item>

  <Form.Item
    label="Fullname"
    name="fullname"
    rules={[
      {
        required: true,
        message: 'Please input your full name!',
      },
    ]}
  >
    <Input/>
  </Form.Item>

  <Form.Item
    label="Phone"
    name="phone"
    rules={[
      {
        required: true,
        message: 'Please input your phone number!',
      },
      {
        pattern: /^[0-9]+$/,
        message: 'Phone number must contain only digits!',
      },
    ]}
  >
    <Input/>
  </Form.Item>

  <Form.Item
    label="Email"
    name="email"
    rules={[
      {
        required: true,
        message: 'Please input your email!',
      },
      {
        type: 'email',
        message: 'Please input a valid email address!',
      },
    ]}
  >
    <Input/>
  </Form.Item>
  <Link to="/login">
  Login
  </Link>
</Form>

   </AuthenTemplate>
  );
}

export default RegisterPage;