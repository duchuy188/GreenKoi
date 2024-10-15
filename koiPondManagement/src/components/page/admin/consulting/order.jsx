import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import api from "../../../config/axios";
import moment from 'moment';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Consultant ID',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      render: (statusId) => {
        // You might want to map statusId to a readable status name
        return statusId;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div>
      <h1>All Orders</h1>
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default Orders;
