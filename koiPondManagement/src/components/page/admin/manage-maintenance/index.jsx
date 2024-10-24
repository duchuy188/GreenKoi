import { useState, useEffect } from "react";
import {
  Table,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Select,
} from "antd";
import api from "../../../config/axios";
import moment from "moment";

const { Option } = Select;

const ManageMaintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editingRequest, setEditingRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [assignForm] = Form.useForm();
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchStaffList();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/maintenance-requests/confirmed");
      console.log("Fetched maintenance requests:", response.data);
      setMaintenanceRequests(response.data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      message.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await api.get("/api/manager/users");
      if (Array.isArray(response.data)) {
        const maintenanceStaff = response.data.filter(user => user.roleId === '4'); // Assuming '5' is the ID for Maintenance Staff
        setStaffList(maintenanceStaff.map(user => ({
          id: user.id,
          name: user.fullName || user.username
        })));
      } else {
        throw new Error("Unexpected data structure");
      }
    } catch (error) {
      console.error("Error fetching staff list:", error);
      message.error("Failed to load staff list");
    }
  };

  const handleEdit = (record) => {
    setEditingRequest(record);
    form.setFieldsValue({
      ...record,
      scheduleDate: moment(record.scheduleDate),
      startDate: moment(record.startDate),
      completionDate: moment(record.completionDate),
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      await api.put(`/api/maintenance-requests/${editingRequest.id}`, {
        ...values,
        scheduleDate: values.scheduleDate.format("YYYY-MM-DD"),
        startDate: values.startDate.format("YYYY-MM-DD"),
        completionDate: values.completionDate.format("YYYY-MM-DD"),
      });

      message.success("Maintenance request updated successfully");
      setIsModalVisible(false);
      fetchMaintenanceRequests();
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      message.error(`Failed to update maintenance request: ${error.message}`);
    }
  };

  const handleAssign = (record) => {
    setEditingRequest(record);
    setIsAssignModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    try {
      await api.patch(`/api/maintenance-requests/${editingRequest.id}/assign`, {
        staffId: selectedStaffId,
      });
      message.success("Maintenance staff assigned successfully");
      setIsAssignModalVisible(false);
      fetchMaintenanceRequests();
    } catch (error) {
      console.error("Error assigning maintenance staff:", error);
      message.error(`Failed to assign maintenance staff: ${error.message}`);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Customer ID", dataIndex: "customerId", key: "customerId" },
    { title: "Project ID", dataIndex: "projectId", key: "projectId" },
    { title: "Consultant ID", dataIndex: "consultantId", key: "consultantId" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Request Status", dataIndex: "requestStatus", key: "requestStatus" },
    { title: "Maintenance Status", dataIndex: "maintenanceStatus", key: "maintenanceStatus" },
    { title: "Agreed Price", dataIndex: "agreedPrice", key: "agreedPrice" },
    {
      title: "Schedule Date",
      dataIndex: "scheduleDate",
      key: "scheduleDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Completion Date",
      dataIndex: "completionDate",
      key: "completionDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button onClick={() => handleAssign(record)}>Assign Staff</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Confirmed Maintenance Requests</h1>
      <Table
        columns={columns}
        dataSource={maintenanceRequests}
        loading={loading}
        rowKey="id"
      />
      
      {/* Existing Edit Modal */}
      <Modal
        title="Edit Maintenance Request"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="requestStatus" label="Request Status">
            <Input />
          </Form.Item>
          <Form.Item name="maintenanceStatus" label="Maintenance Status">
            <Input />
          </Form.Item>
          <Form.Item name="agreedPrice" label="Agreed Price">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="scheduleDate" label="Schedule Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="completionDate" label="Completion Date">
            <DatePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Maintenance Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Staff Modal */}
      <Modal
        title="Assign Maintenance Staff"
        visible={isAssignModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => setIsAssignModalVisible(false)}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a staff member"
          onChange={(value) => setSelectedStaffId(value)}
          loading={staffList.length === 0}
        >
          {staffList.map(staff => (
            <Option key={staff.id} value={staff.id}>{staff.name}</Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default ManageMaintenance;
