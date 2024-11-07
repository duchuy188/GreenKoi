import { Table, Image, Modal, Button, DatePicker, Space } from 'antd';
import { useEffect, useState } from 'react';
import api from "../../../config/axios";
import { toast } from 'react-toastify';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { EyeOutlined } from '@ant-design/icons';

const ConstrucReviewComplete = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  const showNoteModal = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const showImageModal = (images) => {
    setSelectedImages(images);
    setImageModalVisible(true);
  };

  const showReviewModal = async (id) => {
    try {
      const response = await api.get(`/api/maintenance-requests/${id}/review`);
      if (response?.data) {
        setSelectedReview(response.data);
        setReviewModalVisible(true);
      } else {
        toast.warning('Không có dữ liệu đánh giá');
      }
    } catch (error) {
      toast.error('Không thể tải đánh giá. Vì chưa có đánh giá nào');
    }
  };

  const showInfoModal = (record) => {
    setSelectedCustomer(record);
    setInfoModalVisible(true);
  };

  const showDescriptionModal = (description) => {
    setSelectedDescription(description);
    setDescriptionModalVisible(true);
  };

  const columns = [
    {
      title: 'Thông tin',
      key: 'info',
      width: 120,
      fixed: 'left',
      render: (_, record) => (
        <Button onClick={() => showInfoModal(record)}>
          Xem thông tin
        </Button>
      ),
    },
    {
      title: 'ID',
      key: 'index',
      width: 80,
      hidden: true,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 100,
      render: (text) => (
        <Button icon={<EyeOutlined />} onClick={() => showDescriptionModal(text)}>
        </Button>
      ),
    },
    {
      title: 'Giá thỏa thuận',
      dataIndex: 'agreedPrice',
      key: 'agreedPrice',
      width: 130,
      render: (price) => `${price?.toLocaleString('vi-VN')} VNĐ`
      
    },
    {
      title: 'Ngày lên lịch',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 150,
      render: (date) => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
      render: (date) => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completionDate',
      key: 'completionDate',
      width: 150,
      render: (date) => moment(date).format('DD-MM-YYYY')
    },
    {
      title: 'Thông tin bảo trì',
      key: 'maintenanceInfo',
      width: 150,
      render: (_, record) => (
        <Button onClick={() => {
          setSelectedNote(record.maintenanceNotes);
          setSelectedImages(record.maintenanceImages);
          setModalVisible(true);
        }}>
          Xem chi tiết
        </Button>
      ),
    },
    {
      title: 'Xem đánh giá',
      key: 'review',
      width: 120,
      render: (_, record) => (
        <Button onClick={() => showReviewModal(record.id)}>
          Xem đánh giá
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
        title="Chi tiết bảo trì"
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        width={800}
        cancelText="Huỷ"
        okText="Đồng ý"
      >
        <div>
          <h3>Ghi chú:</h3>
          <p>{selectedNote}</p>
          
          <h3>Hình ảnh:</h3>
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
        </div>
      </Modal>
      <Modal
        title="Hình ảnh bảo trì"
        open={imageModalVisible}
        onOk={() => setImageModalVisible(false)}
        onCancel={() => setImageModalVisible(false)}
        width={800}
        cancelText="Huỷ"
        okText="Đồng ý"
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
      <Modal
        title="Chi tiết đánh giá"
        open={reviewModalVisible}
        onOk={() => setReviewModalVisible(false)}
        onCancel={() => setReviewModalVisible(false)}
        cancelText="Huỷ"
        okText="Đồng ý"
      >
        {selectedReview && (
          <div>
            <p><strong>Số sao:</strong> {selectedReview.rating}/5</p>
            <p><strong>Nhận xét:</strong> {selectedReview.comment}</p>
            <p><strong>Ngày đánh giá:</strong> {moment(selectedReview.reviewDate).format('DD-MM-YYYY HH:mm:ss')}</p>
          </div>
        )}
      </Modal>
      <Modal
        title="Thông tin khách hàng"
        open={infoModalVisible}
        onOk={() => setInfoModalVisible(false)}
        onCancel={() => setInfoModalVisible(false)}
        cancelText="Huỷ"
        okText="Đồng ý"
      >
        {selectedCustomer && (
          <div>
            <p><strong>Khách hàng:</strong> {selectedCustomer.customerName}</p>
            <p><strong>Số điện thoại:</strong> {selectedCustomer.customerPhone}</p>
            <p><strong>Email:</strong> {selectedCustomer.customerEmail}</p>
            <p><strong>Địa chỉ:</strong> {selectedCustomer.customerAddress}</p>
            <p><strong>Nhân viên tư vấn:</strong> {selectedCustomer.consultantName}</p>
            <p><strong>Dự án:</strong> {selectedCustomer.projectName}</p>
            <p><strong>Ngày tạo:</strong> {moment(selectedCustomer.createdAt).format('DD-MM-YYYY HH:mm:ss')}</p>
            <p><strong>Ngày cập nhật:</strong> {moment(selectedCustomer.updatedAt).format('DD-MM-YYYY HH:mm:ss')}</p>
          </div>
        )}
      </Modal>
      <Modal
        title="Chi tiết Mô tả"
        open={descriptionModalVisible}
        onOk={() => setDescriptionModalVisible(false)}
        onCancel={() => setDescriptionModalVisible(false)}
        cancelText="Huỷ"
        okText="Đồng ý"
      >
        <p>{selectedDescription}</p>
      </Modal>
    </>
  );
};

export default ConstrucReviewComplete;
