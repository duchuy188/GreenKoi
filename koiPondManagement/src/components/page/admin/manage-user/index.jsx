import { Button, Form, Input, Modal, Popconfirm, Table, Select, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // To store filtered users
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('employees'); // State to toggle between employees/customers

  const roles = [
    { id: '1', name: "Manager" },
    { id: '2', name: "Consulting Staff" },
    { id: '3', name: "Design Staff" },
    { id: '4', name: "Construction Staff" },
    { id: '5', name: "Customer" },
  ];

  const employeeRoles = ['1', '2', '3', '4'];
  const customerRoles = ['5'];

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/manager/users");

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (typeof response.data === 'object' && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
        toast.error("Failed to load users. Unexpected data structure.");
      }
    } catch (err) {
      setUsers([]);
      if (err.response) {
        toast.error(`Error: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
      } else {
        toast.error("Network error. Please check your connection and API URL.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on the user type (employees/customers)
  const filterUsers = () => {
    if (userType === 'employees') {
      setFilteredUsers(users.filter(user => employeeRoles.includes(String(user.roleId))));
    } else {
      setFilteredUsers(users.filter(user => customerRoles.includes(String(user.roleId))));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, userType]);

  // Handle create or update user
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (values.id) {
        await api.put(`/api/manager/users/${values.id}`, values);
      } else {
        const response = await api.post("/api/manager/users", values);
        const roleId = values.roleId;
        const userId = response.data.id;
        await api.post("/api/manager/user_roles", { userId, roleId });
      }

      toast.success("Successfully");
      fetchUsers();
      form.resetFields();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    try {
      await api.put(`/api/manager/users/${id}/block`, { status: "inactive" });
      toast.success("Blocked user successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || "An error occurred");
    }
  };

  const handleUnblock = async (id) => {
    try {
      await api.put(`/api/manager/users/${id}/unblock`, { status: "active" });
      toast.success("Unblocked user successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || "An error occurred");
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === String(roleId));
    return role ? role.name : "Unknown";
  };

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
      title: "Role",
      dataIndex: "roleId",
      key: "roleId",
      render: (roleId) => getRoleName(roleId),
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
      render: (id, record) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              setShowModal(true);
              form.setFieldsValue(record);
            }}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>

          <Popconfirm title="Do you want to block this user?" onConfirm={() => handleBlock(id)}>
            <Button type="default" danger>
              Block
            </Button>
          </Popconfirm>

          <Popconfirm title="Do you want to unblock this user?" onConfirm={() => handleUnblock(id)} style={{ marginLeft: 8 }}>
            <Button type="default">Unblock</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Select value={userType} onChange={setUserType} style={{ marginBottom: 16 }}>
        <Select.Option value="employees">Employees</Select.Option>
        <Select.Option value="customers">Customers</Select.Option>
      </Select>

      <Button type="primary" onClick={() => setShowModal(true)} style={{ marginBottom: 16 }}>
        Add User
      </Button>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: "No users found or error loading data" }}
      />

      <Modal open={showModal} onCancel={() => setShowModal(false)} title="User Management" onOk={() => form.submit()} confirmLoading={loading}>
        <Form form={form} labelCol={{ span: 24 }} onFinish={handleSubmit}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please input username!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please input email!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Please input phone!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: "Please input full name!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleId" label="Role" rules={[{ required: true, message: "Please select role!" }]}>
            <Select placeholder="Select a role">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
