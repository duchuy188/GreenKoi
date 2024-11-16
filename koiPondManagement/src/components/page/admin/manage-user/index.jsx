import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Select,
  Checkbox,
  Tooltip,
  Tag,
} from "antd";
import { EditOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import moment from "moment";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("employees");
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");

  const roles = [
    { id: "1", name: "Quản lý" },
    { id: "2", name: "Nhân viên tư vấn" },
    { id: "3", name: "Nhân viên thiết kế" },
    { id: "4", name: "Nhân viên thi công" },
    { id: "5", name: "Khách hàng" },
  ];

  const employeeRoles = ["1", "2", "3", "4"];
  const customerRoles = ["5"];

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
        toast.error(
          "Không thể tải danh sách người dùng. Cấu trúc dữ liệu không như mong đợi."
        );
      }
    } catch (err) {
      setUsers([]);
      toast.error(
        err.response
          ? `Error: ${err.response.status} - ${err.response.data.message}`
          : "Network error. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (userType === "employees") {
      const employeeUsers = users.filter((user) =>
        employeeRoles.includes(String(user.roleId))
      );

      setFilteredUsers(
        selectedRole === "all"
          ? employeeUsers
          : employeeUsers.filter((user) => String(user.roleId) === selectedRole)
      );
    } else {
      setFilteredUsers(
        users.filter((user) => customerRoles.includes(String(user.roleId)))
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, userType, selectedRole]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Check for duplicate username and email
      const isDuplicateUsername = users.some(
        (user) => user.username === values.username && user.id !== values.id
      );
      const isDuplicateEmail = users.some(
        (user) => user.email === values.email && user.id !== values.id
      );

      if (isDuplicateUsername) {
        toast.error("Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.");
        return;
      }

      if (isDuplicateEmail) {
        toast.error("Email đã tồn tại! Vui lòng chọn email khác.");
        return;
      }

      if (values.id) {
        await api.put(`/api/manager/users/${values.id}`, values);
        toast.success("Người dùng đã cập nhật thành công");
      } else {
        const response = await api.post("/api/manager/users", values);
        if (response.status === 200) {
          toast.success("Người dùng đã thêm thành công");
        } else {
          throw new Error(`Request failed with status code ${response.status}`);
        }
      }

      fetchUsers();
      form.resetFields();
      setShowModal(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    try {
      await api.put(`/api/manager/users/${id}/block`, { status: "inactive" });
      toast.success("Khóa người dùng thành công!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || "An error occurred");
    }
  };

  const handleUnblock = async (id) => {
    try {
      await api.put(`/api/manager/users/${id}/unblock`, { status: "active" });
      toast.success("Mở khóa người dùng thành công!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || "An error occurred");
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === String(roleId));
    return role ? role.name : "Không xác định";
  };

  const isManager = (roleId) => String(roleId) === "1";

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    { title: "Tên đăng nhập", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Họ tên", dataIndex: "fullName", key: "fullName" },
    {
      title: "Chức vụ",
      dataIndex: "roleId",
      key: "roleId",
      render: getRoleName,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active ? "success" : "error"}>
          {active ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => moment(createdAt).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => moment(updatedAt).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <>
          <Tooltip title="Sửa người dùng">
            <Popconfirm
              title="Bạn có muốn sửa người dùng này không?"
              onConfirm={() => {
                setShowModal(true);
                form.setFieldsValue(record);
                setIsEdit(true);
              }}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="link" icon={<EditOutlined />} />
            </Popconfirm>
          </Tooltip>
          {!isManager(record.roleId) && (
            <>
              <Tooltip title="Khóa người dùng">
                <Popconfirm
                  title="Bạn có muốn khóa người dùng này không?"
                  onConfirm={() => handleBlock(id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Button type="link" icon={<LockOutlined />} danger />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="Mở khóa người dùng">
                <Popconfirm
                  title="Bạn có muốn mở khóa người dùng này không?"
                  onConfirm={() => handleUnblock(id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Button type="link" icon={<UnlockOutlined />} />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Quản lý người dùng</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: 16,
          gap: "16px",
        }}
      >
        <Select value={userType} onChange={setUserType}>
          <Select.Option value="employees">Nhân viên</Select.Option>
          <Select.Option value="customers">Khách hàng</Select.Option>
        </Select>

        {userType === "employees" && (
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ width: 200 }}
            placeholder="Lọc theo chức vụ"
          >
            <Select.Option value="all">Tất cả nhân viên</Select.Option>
            <Select.Option value="1">Quản lý</Select.Option>
            <Select.Option value="2">Nhân viên tư vấn</Select.Option>
            <Select.Option value="3">Nhân viên thiết kế</Select.Option>
            <Select.Option value="4">Nhân viên thi công</Select.Option>
          </Select>
        )}
      </div>
      <Button
        type="primary"
        onClick={() => {
          setShowModal(true);
          setIsEdit(false);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm người dùng
      </Button>
      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: "Không tìm thấy người dùng hoặc lỗi tải dữ liệu" }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
        }}
      />
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title="Quản lý người dùng"
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={400}
        okText="Đồng ý"
        cancelText="Hủy"
      >
        <Form
          form={form}
          labelCol={{ span: 24 }}
          onFinish={handleSubmit}
          size="small"
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Số điện thoại phải có đúng 10 chữ số!",
              },
              {
                validator: (_, value) => {
                  if (value && /[^0-9]/.test(value)) {
                    return Promise.reject("Chỉ được nhập số!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input style={{ width: "100%" }} maxLength={10} />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
          {!isEdit && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password style={{ width: "100%" }} />
            </Form.Item>
          )}
          <Form.Item
            name="roleId"
            label="Chức vụ"
            rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
          >
            <Select
              placeholder="Chọn chức vụ"
              style={{ width: "100%" }}
              disabled={isEdit && isManager(form.getFieldValue("roleId"))}
            >
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="active" label="Trạng thái" valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
