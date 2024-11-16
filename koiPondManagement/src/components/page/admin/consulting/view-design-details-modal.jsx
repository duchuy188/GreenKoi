import React, { useState } from 'react';
import { Modal, Typography, Descriptions, Space, Button, Input, message } from 'antd';
import moment from 'moment';
import axios from '../../../config/axios';

const { Text } = Typography;
const { TextArea } = Input;

const ViewDesignDetailsModal = ({ visible, onCancel, designDetails, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  if (!designDetails) return null;

  const handleReview = async (approved) => {
    try {
      setLoading(true);
      
      // Tạo query params khác nhau cho approve/reject
      const queryParams = new URLSearchParams();
      queryParams.append('consultantUsername', 'consultant1'); // Thay thế bằng username thực tế
      
      if (approved) {
        queryParams.append('reviewNotes', notes);
        queryParams.append('approved', 'true');
      } else {
        queryParams.append('rejectionReason', notes);
        queryParams.append('approved', 'false');
      }

      await axios.post(
        `/api/design-requests/${designDetails.id}/consultant-review?${queryParams.toString()}`
      );
      
      message.success(approved ? 'Đã phê duyệt thiết kế' : 'Đã từ chối thiết kế');
      onSuccess?.();
      onCancel();
    } catch (error) {
      let errorMessage = 'Đã có lỗi xảy ra khi xử lý yêu cầu';
      
      if (error.response) {
        if (error.response.data?.includes('Design request already exists for this consultation')) {
          errorMessage = 'Yêu cầu thiết kế đã tồn tại cho buổi tư vấn này';
        } else {
          switch (error.response.status) {
            case 400:
              errorMessage = 'Dữ liệu không hợp lệ';
              break;
            case 401:
              errorMessage = 'Bạn không có quyền thực hiện thao tác này';
              break;
            case 404:
              errorMessage = 'Không tìm thấy thiết kế';
              break;
            case 500:
              errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
              break;
            default:
              errorMessage = 'Đã có lỗi xảy ra, vui lòng thử lại';
          }
        }
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chi tiết thiết kế"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Tên designer">
          {designDetails.designerName}
        </Descriptions.Item>
        <Descriptions.Item label="Tên thiết kế">
          {designDetails.designName}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          {designDetails.designDescription}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          {designDetails.designNotes}
        </Descriptions.Item>
        <Descriptions.Item label="Chi phí ước tính">
          {designDetails.estimatedCost?.toLocaleString('vi-VN')} VNĐ
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {moment(designDetails.createdAt).format('DD/MM/YYYY HH:mm')}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <TextArea
          rows={4}
          placeholder={`Nhập ${loading ? 'ghi chú đánh giá' : 'lý do từ chối'}...`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        <Space>
          <Button 
            type="primary" 
            onClick={() => handleReview(true)}
            loading={loading}
          >
            Phê duyệt
          </Button>
          <Button 
            danger
            onClick={() => handleReview(false)}
            loading={loading}
          >
            Từ chối
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default ViewDesignDetailsModal; 