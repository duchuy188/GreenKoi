import React, { useState, useEffect } from 'react';
import { Table, message, Modal, Form, Input, DatePicker, InputNumber, Button, Popconfirm, Dropdown, Menu } from 'antd';
import api from "../../../config/axios";
import moment from 'moment';
import { EditOutlined, DownOutlined } from '@ant-design/icons';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editingOrder, setEditingOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects/consultant');
      console.log('Fetched orders:', response.data);
      // Sort orders by createdAt in descending order
      const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingOrder(record);
    form.setFieldsValue({
      ...record,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
    });
    setIsModalVisible(true);
  };
  const statusOptions = [

    { value: 'APPROVED', label: 'Approved' },
    { value: 'PLANNING', label: 'Planning' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'MAINTENANCE', label: 'Maintenance' },

    // Add more statuses as needed
  ];
  const handleUpdate = async (values) => {
    try {
      // Update general information
      await api.put(`/api/projects/${editingOrder.id}`, {
        name: values.name,
        description: values.description,
        totalPrice: values.totalPrice,
        depositAmount: values.depositAmount,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        customerId: values.customerId,
        consultantId: values.consultantId,
      });

      // Update status if changed
      if (values.statusId !== editingOrder.statusId) {
        await updateOrderStatus(editingOrder.id, values.statusId);
      }

      message.success('Order updated successfully');
      setIsModalVisible(false);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order:', error);
      message.error(`Failed to update order: ${error.response?.data?.message || error.message}`);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/projects/${id}/status`, { newStatus });
      message.success("Order status updated successfully!");
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      message.error(err.response?.data?.message || "Error updating order status.");
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      hidden: true, // This will hide the column
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Tổng giá',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },
    {
      title: 'Tiền cọc',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerId',
    },
    {
      title: 'Nhân viên TV',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusId',
      key: 'statusId',
      render: (statusId) => {
        const status = statusOptions.find(s => s.value === statusId);
        return status ? status.label : statusId;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => {
        const menu = (
          <Menu onClick={({ key }) => updateOrderStatus(record.id, key)}>
            {statusOptions.map(status => (
              <Menu.Item key={status.value}>{status.label}</Menu.Item>
            ))}
          </Menu>
        );

        return (
          <>
            <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
              Edit
            </Button>
            <Dropdown overlay={menu}>
              <Button>
                Update Status <DownOutlined />
              </Button>
            </Dropdown>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <h1>Đơn hàng của khách hàng</h1>
      <Table
        columns={columns.filter(column => !column.hidden)}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{ defaultSortOrder: 'descend' }}
      />
      <Modal
        title="Edit Order"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="totalPrice" label="Total Price" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="depositAmount" label="Deposit Amount">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="customerId" label="Customer ID">
            <Input />
          </Form.Item>
          <Form.Item name="consultantId" label="Consultant ID">
            <Input />
          </Form.Item>
          <Form.Item name="createdAt" label="Created At">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Order
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
