import { Table, Image, Modal, Button } from 'antd';
import { useEffect, useState } from 'react';
import api from "../../../config/axios";
import { toast } from 'react-toastify';

const ConstrucReviewComplete = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

  const showNoteModal = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const showAttachmentModal = (attachments) => {
    const formattedAttachments = attachments.map(attachment => {
      if (typeof attachment === 'string') {
        // Assume it's an image URL if it's a string
        return { type: 'image', url: attachment };
      }
      return attachment;
    });
    setSelectedAttachments(formattedAttachments);
    setAttachmentModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      hidden: true,
    },
    {
      title: 'Khách hàng ID',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Dự án ID',
      dataIndex: 'projectId',
      key: 'projectId',
    },
    {
      title: 'Tư vấn viên ID',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Tài liệu đính kèm',
      dataIndex: 'attachments',
      key: 'attachments',
    },
    {
      title: 'Trạng thái yêu cầu',
      dataIndex: 'requestStatus',
      key: 'requestStatus',
      hidden: true,
    },
    {
      title: 'Trạng thái bảo trì',
      dataIndex: 'maintenanceStatus',
      key: 'maintenanceStatus',
      hidden: true,
    },
    {
      title: 'Giá đồng ý',
      dataIndex: 'agreedPrice',
      key: 'agreedPrice',
    },
    {
      title: 'Ngày lên lịch',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completionDate',
      key: 'completionDate',
    },
    {
      title: 'Giao cho',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
    {
      title: 'Lý do hủy',
      dataIndex: 'cancellationReason',
      key: 'cancellationReason',
      hidden: true,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: 'Ghi chú bảo trì',
      dataIndex: 'maintenanceNotes',
      key: 'maintenanceNotes',
      render: (text) => (
        <Button onClick={() => showNoteModal(text)}>
          Xem ghi chú
        </Button>
      ),
    },
    {
      title: 'Hình ảnh bảo trì',
      dataIndex: 'maintenanceImages',
      key: 'maintenanceImages',
      render: (images) => (
        <Image.PreviewGroup>
          {images.map((image, index) => (
            <Image key={index} width={50} src={image} />
          ))}
        </Image.PreviewGroup>
      ),
    },
  ];

  const fetchCompletedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/maintenance-requests/completed');
      setData(response.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu yêu cầu bảo trì đã hoàn thành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  return (
    <>
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading}
        rowKey="id"
      />
      <Modal
        title="Chi tiết ghi chú"
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <p>{selectedNote}</p>
      </Modal>
      <Modal
        title="Tài liệu đính kèm"
        visible={attachmentModalVisible}
        onOk={() => setAttachmentModalVisible(false)}
        onCancel={() => setAttachmentModalVisible(false)}
        width={800}
      >
        <Image.PreviewGroup>
          {selectedAttachments.map((attachment, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              {attachment.type === 'image' ? (
                <Image
                  src={attachment.url}
                  alt={`Attachment ${index + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              ) : (
                <a 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '16px', textDecoration: 'underline' }}
                >
                  {attachment.name || `Tài liệu ${index + 1}`}
                </a>
              )}
            </div>
          ))}
        </Image.PreviewGroup>
      </Modal>
    </>
  );
};

export default ConstrucReviewComplete;
