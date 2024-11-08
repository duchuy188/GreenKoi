import React from 'react';
import { Modal, Select, Form } from 'antd';
import api from '../../../config/axios';
import { toast } from 'react-toastify';

const UpdateStatusModal = ({ visible, onCancel, onSuccess, record }) => {
  const [form] = Form.useForm();

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return [{ value: "IN_PROGRESS", label: "Đang thực hiện" }];
      case "IN_PROGRESS":
        return [{ value: "PROCEED_DESIGN", label: "Chuyển sang thiết kế" }];
      case "PROCEED_DESIGN":
        return [{ value: "COMPLETED", label: "Hoàn thành" }];
      default:
        return [];
    }
  };

  const availableStatuses = getNextStatus(record?.status);

  React.useEffect(() => {
    if (availableStatuses.length === 1) {
      form.setFieldsValue({ status: availableStatuses[0].value });
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await api.put(`/api/ConsultationRequests/${record.id}/status`, null, {
        params: {
          newStatus: values.status
        }
      });

      toast.success('Cập nhật trạng thái thành công');
      onSuccess();
      onCancel();
    } catch (error) {
      toast.error(
        error.response
          ? `Lỗi: ${error.response.status} - ${error.response.data.message}`
          : 'Không thể cập nhật trạng thái'
      );
    }
  };

  return (
    <Modal
      title="Cập Nhật Trạng Thái"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="status"
          label="Trạng thái mới"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select>
            {availableStatuses.map(status => (
              <Select.Option key={status.value} value={status.value}>
                {status.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateStatusModal; 