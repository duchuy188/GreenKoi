import { Table, Image, Modal, Button, DatePicker, Space } from 'antd';
import { useEffect, useState } from 'react';
import api from "../../../config/axios";
import { toast } from 'react-toastify';
import moment from 'moment';

const { RangePicker } = DatePicker;

const ConstrucReviewComplete = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const showNoteModal = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const showAttachmentModal = (attachments) => {
    const formattedAttachments = attachments.map(attachment => {
      if (typeof attachment === 'string') { 
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
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Tư vấn viên',
      dataIndex: 'consultantName',
      key: 'consultantName',
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

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (!dates) {
      setFilteredData(data); // Reset về data gốc nếu xóa date range
      return;
    }

    const [startDate, endDate] = dates;
    const filtered = data.filter(item => {
      const itemDate = moment(item.createdAt); // hoặc trường ngày phù hợp của bạn
      return itemDate.isBetween(startDate, endDate, 'day', '[]');
    });

    setFilteredData(filtered);
  };

  const fetchCompletedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/maintenance-requests/completed');
      
      const formattedData = response.data.map(item => ({
        ...item,
        customerName: item.customer?.name || item.customerName || 'Chưa có tên',
        projectName: item.project?.name || item.projectName || 'Chưa có tên',
        consultantName: item.consultant?.name || item.consultantName || 'Chưa có tên'
      }));

      setData(formattedData);
      setFilteredData(formattedData); // Set dữ liệu ban đầu cho filteredData
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          locale={locale}
          style={{ width: '100%' }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData.length > 0 ? filteredData : data}
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
