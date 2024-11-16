import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { toast } from 'react-toastify';
import api from '../../../config/axios';

const CreateDesignRequestModal = ({ visible, onCancel, onSuccess, record }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && record) {
      // Pre-fill form với data từ consultation request
      form.setFieldsValue({
        customerName: record.customerName,
        customerPhone: record.customerPhone,
        customerAddress: record.customerAddress,
        preferredStyle: record.preferredStyle,
        dimensions: record.dimensions,
        requirements: record.requirements,
        budget: record.budget,
        notes: record.notes
      });
    }
  }, [visible, record]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Tạo payload theo đúng format API yêu cầu
      const requestData = {
        id: record.id, // consultationId
        customerId: record.customerId,
        customerName: record.customerName,
        customerPhone: record.customerPhone,
        customerAddress: record.customerAddress,
        preferredStyle: record.preferredStyle,
        dimensions: record.dimensions,
        requirements: record.requirements,
        budget: record.budget,
        notes: record.notes,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Sending design request data:', requestData); // Debug log

      const response = await api.post(`/api/design-requests/consultation/${record.id}`, requestData);
      console.log('Design request created:', response.data); // Debug log
      
      toast.success('Đã tạo yêu cầu thiết kế thành công');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error creating design request:', error);
      console.error('Error response:', error.response); // Debug log
      toast.error(
        error.response
          ? `Lỗi: ${error.response.status} - ${error.response.data.message}`
          : 'Không thể tạo yêu cầu thiết kế'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo Yêu Cầu Thiết Kế"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Tạo yêu cầu"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="customerName"
          label="Tên khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="customerPhone"
          label="Số điện thoại"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="customerAddress"
          label="Địa chỉ"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="preferredStyle"
          label="Loại hồ"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="dimensions"
          label="Kích thước"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="requirements"
          label="Yêu cầu thiết kế"
        >
          <Input.TextArea disabled />
        </Form.Item>

        <Form.Item
          name="budget"
          label="Ngân sách"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <Input.TextArea disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDesignRequestModal; 