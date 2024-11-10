import React, { useState } from 'react';
import { Modal, Select, Form } from 'antd';
import api from '../../../config/axios';
import { toast } from 'react-toastify';

const UpdateStatusModal = ({ visible, onCancel, onSuccess, record }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const values = await form.validateFields();
      
      await api.put(`/api/ConsultationRequests/${record.id}/status`, null, {
        params: {
          newStatus: values.status
        }
      });

      if (values.status === "COMPLETED" && record.status === "PROCEED_DESIGN") {
        try {
          await api.post(`/api/design-requests/${record.id}/consultant-review`, {
            requestId: record.id,
            reviewNotes: "Design approved",
            approved: true
          });
        } catch (reviewError) {
          console.error('Error in consultant review:', reviewError);
          toast.error('Không thể gửi đánh giá thiết kế');
          return;
        }
      }

      toast.success('Cập nhật trạng thái thành công');
      onSuccess();
      onCancel();
    } catch (error) {
      toast.error(
        error.response
          ? `Lỗi: ${error.response.status} - ${error.response.data.message}`
          : 'Không thể cập nhật trạng thái'
      );
    } finally {
      setLoading(false);
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
      confirmLoading={loading}
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