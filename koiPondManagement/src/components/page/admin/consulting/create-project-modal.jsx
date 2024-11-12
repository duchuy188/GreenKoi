import React from 'react';
import { Modal, Form, Input, DatePicker, InputNumber } from 'antd';
import moment from 'moment';

const CreateProjectModal = ({ visible, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        ...initialData,
        startDate: moment(initialData.startDate),
        endDate: moment(initialData.endDate),
      });
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Tạo Dự Án Mới"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Tên Dự Án"
          rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô Tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="totalPrice"
          label="Tổng Giá"
          rules={[{ required: true, message: 'Vui lòng nhập tổng giá' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="depositAmount"
          label="Số Tiền Đặt Cọc"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền đặt cọc' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Ngày Bắt Đầu"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="Ngày Kết Thúc"
          rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal; 