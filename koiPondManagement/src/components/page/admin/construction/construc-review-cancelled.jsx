import { Table, Image, Modal, Button } from 'antd';
import { useEffect, useState } from 'react';
import api from "../../../config/axios";
import { toast } from 'react-toastify';

const ConstrucReviewCancelled = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');

  const showNoteModal = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Project ID',
      dataIndex: 'projectId',
      key: 'projectId',
    },
    {
      title: 'Consultant ID',
      dataIndex: 'consultantId',
      key: 'consultantId',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Attachments',
      dataIndex: 'attachments',
      key: 'attachments',
    },
    {
      title: 'Request Status',
      dataIndex: 'requestStatus',
      key: 'requestStatus',
    },
    {
      title: 'Maintenance Status',
      dataIndex: 'maintenanceStatus',
      key: 'maintenanceStatus',
    },
    {
      title: 'Agreed Price',
      dataIndex: 'agreedPrice',
      key: 'agreedPrice',
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Completion Date',
      dataIndex: 'completionDate',
      key: 'completionDate',
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
    {
      title: 'Cancellation Reason',
      dataIndex: 'cancellationReason',
      key: 'cancellationReason',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: 'Maintenance Notes',
      dataIndex: 'maintenanceNotes',
      key: 'maintenanceNotes',
      render: (text) => (
        <Button onClick={() => showNoteModal(text)}>
          Xem ghi chú
        </Button>
      ),
    },
    {
      title: 'Maintenance Images',
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

  const fetchCancelledRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/maintenance-requests/cancelled');
      setData(response.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu yêu cầu bảo trì đã hủy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledRequests();
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
    </>
  );
};

export default ConstrucReviewCancelled;
