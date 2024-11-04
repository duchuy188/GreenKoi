import { Table, Image, Modal, Button, DatePicker, Space } from 'antd';
import { useEffect, useState } from 'react';
import api from "../../../config/axios";
import { toast } from 'react-toastify';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';

const ConstrucReviewComplete = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const showNoteModal = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const showImageModal = (images) => {
    setSelectedImages(images);
    setImageModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      key: 'index',
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
    },
    {
      title: 'SĐT',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      key: 'customerEmail',
      width: 150,
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
    },
    {
      title: 'Nhân viên tư vấn',
      dataIndex: 'consultantName',
      key: 'consultantName',
      width: 150,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'customerAddress',
      key: 'customerAddress',
      width: 200,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'Giá thỏa thuận',
      dataIndex: 'agreedPrice',
      key: 'agreedPrice',
      width: 130,
      render: (price) => price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    },
    {
      title: 'Ngày lên lịch',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 150,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completionDate',
      key: 'completionDate',
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Ghi chú bảo trì',
      dataIndex: 'maintenanceNotes',
      key: 'maintenanceNotes',
      width: 150,
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
      width: 150,
      render: (images) => (
        <Button onClick={() => showImageModal(images)}>
          Xem hình ảnh ({images.length})
        </Button>
      ),
    },
  ];

  const fetchCompletedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/maintenance-requests/completed');

      if (response?.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [response.data];
        const formattedData = dataArray.map(item => ({
          key: item?.id || Math.random(),
          id: item?.id || '',
          customerName: item?.customerName || '',
          customerPhone: item?.customerPhone || '',
          customerEmail: item?.customerEmail || '',
          customerAddress: item?.customerAddress || '',
          projectName: item?.projectName || '',
          consultantName: item?.consultantName || '',
          description: item?.description || '',
          agreedPrice: Number(item?.agreedPrice) || 0,
          depositAmount: Number(item?.depositAmount) || 0,
          remainingAmount: Number(item?.remainingAmount) || 0,
          scheduledDate: item?.scheduledDate || '',
          startDate: item?.startDate || '',
          completionDate: item?.completionDate || '',
          assignedTo: item?.assignedTo || '',
          maintenanceNotes: item?.maintenanceNotes || '',
          maintenanceImages: Array.isArray(item?.maintenanceImages) ? item.maintenanceImages : [],
          createdAt: item?.createdAt || '',
          updatedAt: item?.updatedAt || ''
        }));

        setData(formattedData);
      } else {
        setData([]);
        toast.warning('Không có dữ liệu');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        config: error.config
      });
      toast.error('Không thể tải dữ liệu: ' + error.message);
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
        title="Hình ảnh bảo trì"
        visible={imageModalVisible}
        onOk={() => setImageModalVisible(false)}
        onCancel={() => setImageModalVisible(false)}
        width={800}
      >
        <Image.PreviewGroup>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {selectedImages.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Maintenance image ${index + 1}`}
                style={{ width: '100%', objectFit: 'cover' }}
              />
            ))}
          </div>
        </Image.PreviewGroup>
      </Modal>
    </>
  );
};

export default ConstrucReviewComplete;
