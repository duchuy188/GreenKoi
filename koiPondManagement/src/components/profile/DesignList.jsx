import React, { useState, useEffect } from 'react';
import { Table, message, Button, Modal, Input, Space } from 'antd';
import api from "../config/axios";

function DesignList() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const response = await api.get('/api/design-requests/customer');
      const filteredDesigns = response.data.filter(design => 
        design.designId && design.status === 'PENDING_CUSTOMER_APPROVAL'
      );
      console.log(filteredDesigns);
      setDesigns(filteredDesigns);
    } catch (error) {
      console.error('Error fetching designs:', error);
      message.error('Không thể tải danh sách thiết kế');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (record) => {
    try {
      await api.post(`/api/design-requests/${record.id}/customer-approval?approved=true`);
      message.success('Đã phê duyệt thiết kế');
      fetchDesigns();
    } catch (error) {
      console.error('Error approving design:', error);
      message.error('Không thể phê duyệt thiết kế');
    }
  };

  const handleReject = async (record) => {
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await api.post(
        `/api/design-requests/${record.id}/customer-approval?approved=false&rejectionReason=${encodeURIComponent(rejectReason)}`
      );
      setModalVisible(false);
      setRejectReason('');
      message.success('Đã từ chối thiết kế');
      fetchDesigns();
    } catch (error) {
      console.error('Error rejecting design:', error);
      message.error('Không thể từ chối thiết kế');
    }
  };

  const columns = [
    {
      title: 'Tên thiết kế',
      dataIndex: 'designName',
      key: 'designName',
    },
    {
      title: 'Mô tả',
      dataIndex: 'designDescription',
      key: 'designDescription',
    },
    {
      title: 'Ngân sách',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (estimatedCost) => estimatedCost ? `${estimatedCost.toLocaleString()} VNĐ` : 'Chưa xác định',
    },
    {
      title: 'Người thiết kế',
      dataIndex: 'designerName',
      key: 'designerName',
    },
    {
      title: 'Ghi chú thiết kế',
      dataIndex: 'designNotes',
      key: 'designNotes',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING_CUSTOMER_APPROVAL': 'Chờ phê duyệt',
          'APPROVED': 'Đã phê duyệt',
          'REJECTED': 'Đã từ chối',
          'IN_PROGRESS': 'Đang thực hiện'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        record.status === 'PENDING_CUSTOMER_APPROVAL' && (
          <Space>
            <Button 
              type="primary" 
              onClick={() => handleApprove(record)}
            >
              Phê duyệt
            </Button>
            <Button 
              danger
              onClick={() => {
                setSelectedDesign(record);
                setModalVisible(true);
              }}
            >
              Từ chối
            </Button>
          </Space>
        )
      ),
    }
  ];

  return (
    <>
      <Table
        loading={loading}
        dataSource={designs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div>
              <p><strong>Ghi chú người đánh giá:</strong> {record.reviewerNotes}</p>
              {record.status === 'REJECTED' && (
                <p><strong>Lý do từ chối:</strong> {record.rejectionReason}</p>
              )}
              <p><strong>Số lần chỉnh sửa:</strong> {record.revisionCount}</p>
              <p><strong>Ngày tạo:</strong> {new Date(record.createdAt).toLocaleString()}</p>
              <p><strong>Cập nhật lần cuối:</strong> {new Date(record.updatedAt).toLocaleString()}</p>
            </div>
          ),
        }}
      />

      <Modal
        title="Từ chối thiết kế"
        open={modalVisible}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
        onOk={() => handleReject(selectedDesign)}
        onCancel={() => {
          setModalVisible(false);
          setRejectReason('');
        }}
      >
        <Input.TextArea
          placeholder="Nhập lý do từ chối"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
        />
      </Modal>
    </>
  );
}

export default DesignList; 