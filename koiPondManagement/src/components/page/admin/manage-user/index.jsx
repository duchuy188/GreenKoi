import { Button, Form, Input, Modal, Popconfirm, Table, Select, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import moment from "moment";  // Import moment for date formatting

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('employees');
  const [isEdit, setIsEdit] = useState(false); 

  const roles = [
    { id: '1', name: "Manager" },
    { id: '2', name: "Consulting Staff" },
    { id: '3', name: "Design Staff" },
    { id: '4', name: "Construction Staff" },
    { id: '5', name: "Customer" },
  ];

  const employeeRoles = ['1', '2', '3', '4'];
  const customerRoles = ['5'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/manager/users");
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
        toast.error("Failed to load users. Unexpected data structure.");
      }
    } catch (err) {
      setUsers([]);
      toast.error(err.response ? `Error: ${err.response.status} - ${err.response.data.message}` : "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    setFilteredUsers(userType === 'employees'
      ? users.filter(user => employeeRoles.includes(String(user.roleId)))
      : users.filter(user => customerRoles.includes(String(user.roleId))));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, userType]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (values.id) {
        await api.put(`/api/manager/users/${values.id}`, values);
        toast.success("User updated successfully");
      } else {
        const response = await api.post("/api/manager/users", values);
        if (response.status === 200) {
          toast.success("User added successfully");
        } else {
          throw new Error(`Request failed with status code ${response.status}`);
        }
      }
      fetchUsers();
      form.resetFields();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "An error occurred");
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
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    { title: "Role", dataIndex: "roleId", key: "roleId", render: getRoleName },
    { title: "Active", dataIndex: "active", key: "active", render: (active) => (active ? "Active" : "Inactive") },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => moment(createdAt).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => moment(updatedAt).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Action", dataIndex: "id", key: "id", render: (id, record) => (
        <>
          <Button type="primary" onClick={() => { setShowModal(true); form.setFieldsValue(record); setIsEdit(true); }} style={{ marginRight: 8 }}>Edit</Button>
          <Popconfirm title="Do you want to block this user?" onConfirm={() => handleBlock(id)}>
            <Button type="default" danger>Block</Button>
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
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
        <Select value={userType} onChange={setUserType}>
          <Select.Option value="employees">Employees</Select.Option>
          <Select.Option value="customers">Customers</Select.Option>
        </Select>
      </div>
      <Button type="primary" onClick={() => { setShowModal(true); setIsEdit(false); form.resetFields(); }} style={{ marginBottom: 16 }}>Add User</Button>
      <Table dataSource={filteredUsers} columns={columns} rowKey="id" loading={loading} locale={{ emptyText: "No users found or error loading data" }} />
      <Modal open={showModal} onCancel={() => setShowModal(false)} title="User Management" onOk={() => form.submit()} confirmLoading={loading} width={400}>
        <Form form={form} labelCol={{ span: 24 }} onFinish={handleSubmit} size="small">
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please input username!" }]}><Input style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please input email!" }]}><Input style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Please input phone!" }]}><Input style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: "Please input full name!" }]}><Input style={{ width: '100%' }} /></Form.Item>
          {!isEdit && (
            <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please input password!" }]}><Input.Password style={{ width: '100%' }} /></Form.Item>
          )}
          <Form.Item name="roleId" label="Role" rules={[{ required: true, message: "Please select role!" }]}>
            <Select placeholder="Select a role" style={{ width: '100%' }}>
              {roles.map((role) => <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked"><Checkbox /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
