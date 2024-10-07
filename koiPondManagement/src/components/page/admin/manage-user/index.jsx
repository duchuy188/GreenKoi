import { Button, Form, Input, Modal, Popconfirm, Table } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios"; // Đảm bảo cấu hình axios đúng cách

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/manager/users");
      console.log("API Response:", response);

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (typeof response.data === 'object' && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.error("Unexpected data structure:", response.data);
        setUsers([]);
        toast.error("Failed to load users. Unexpected data structure.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
      if (err.response) {
        console.error("Error response:", err.response);
        toast.error(`Error: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        console.error("Error request:", err.request);
        toast.error("Network error. Please check your connection and API URL.");
      } else {
        console.error("Error message:", err.message);
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tạo hoặc cập nhật người dùng
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (values.id) {
        // Cập nhật người dùng
        await api.put(`/api/manager/users/${values.id}`, values);
      } else {
        // Tạo mới người dùng
        const response = await api.post("/api/manager/users", values);

        // Phân quyền người dùng
        const roleId = values.roleId;
        const userId = response.data.id;
        await api.post("/api/manager/user_roles", { userId, roleId });
      }

      toast.success("Successfully");
      fetchUsers();
      form.resetFields();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  // Xóa người dùng
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/manager/users/${id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  // Block người dùng
  const handleBlock = async (id) => {
    try {
      await api.put(`/api/manager/users/${id}/block`, { status: "inactive" });
      toast.success("Block user thành công!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  // Unblock người dùng
  const handleUnblock = async (id) => {
    try {
      await api.put(`/api/manager/users/${id}/unblock`, { status: "active" });
      toast.success("Unblock user thành công!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  // Lấy danh sách người dùng khi component load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Cấu hình các cột trong bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Role ID",
      dataIndex: "roleId",
      key: "roleId",
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (active) => (active ? "Active" : "Inactive"),
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              setShowModal(true);
              form.setFieldsValue({ id });
            }}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>

          <Popconfirm
            title="Do you want to delete this user?"
            onConfirm={() => handleDelete(id)}
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Do you want to block this user?"
            onConfirm={() => handleBlock(id)}
            style={{ marginLeft: 8 }}
          >
            <Button type="default" danger>
              Block
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Do you want to unblock this user?"
            onConfirm={() => handleUnblock(id)}
            style={{ marginLeft: 8 }}
          >
            <Button type="default">
              Unblock
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setShowModal(true)} style={{ marginBottom: 16 }}>
        Add User
      </Button>

      <Table 
        dataSource={users} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        locale={{ emptyText: "No users found or error loading data" }}
      />

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title="User Management"
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} labelCol={{ span: 24 }} onFinish={handleSubmit}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Please input phone!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please input full name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="roleId"
            label="Role ID"
            rules={[{ required: true, message: "Please input role ID!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
