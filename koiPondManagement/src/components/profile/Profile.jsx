import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from '/src/components/config/axios';
import "./Profile.css";
import { Button, Form, Input, Modal, Table, Tabs, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm] = Form.useForm();
  
  // Get user information from Redux store
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProfileData();
      console.log("Profile data after fetch:", profileData);
      await fetchConsultationRequests();
    };

    fetchData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      let profileInfo = {};
      
      // Nếu có dữ liệu từ Redux, sử dụng nó
      if (user) {
        profileInfo = {
          id: user.id,
          fullName: user.username || user.email,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          role: user.role || 'User',
          projectCount: user.projectCount || 0
        };
      }
      
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get("/api/profile", {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data && typeof response.data === 'object') {
            console.log("Raw profile data:", response.data);
            // Kết hợp dữ liệu từ API với profileInfo
            profileInfo = { ...profileInfo, ...response.data };
          } else {
            throw new Error('Invalid profile data');
          }
        } catch (apiError) {
          console.error("Lỗi khi lấy hồ sơ từ API:", apiError);
        }
      }
      
      // Đảm bảo rằng id được lưu vào localStorage
      if (profileInfo.id) {
        localStorage.setItem('customerId', profileInfo.id);
      }
      
      console.log("Final profile info:", profileInfo);
      setProfileData(profileInfo);
    } catch (err) {
      console.error("Error in fetchProfileData:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultationRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Sử dụng ID từ thông tin profile nếu có
      const customerId = profileData?.id || localStorage.getItem('customerId');
      if (!customerId) {
        throw new Error('No customer ID found');
      }

      const response = await api.get(`/api/ConsultationRequests/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Consultation requests:", response.data);
      setConsultationRequests(response.data);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm yêu cầu tư vấn:", err);
      message.error('Không tải được yêu cầu tư vấn');
    }
  };
  const handleEditInfo = () => {
    form.setFieldsValue(profileData);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/ConsultationRequests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Yêu cầu đã được xóa thành công');
      fetchConsultationRequests(); // Refresh the list
    } catch (err) {
      console.error("Lỗi khi xóa yêu cầu tư vấn:", err);
      message.error('Không thể xóa yêu cầu tư vấn');
    }
  };

  const handleEdit = (record) => {
    setEditingRequest(record);
    editForm.setFieldsValue({
      designName: record.designName,
      notes: record.notes,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      customerAddress: record.customerAddress
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/api/ConsultationRequests/${editingRequest.id}`, {
        ...editingRequest,
        ...values,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        message.success('Yêu cầu đã được cập nhật thành công');
        setEditingRequest(null);
        fetchConsultationRequests(); // Refresh the list
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật yêu cầu tư vấn:", err);
      message.error('Không thể cập nhật yêu cầu tư vấn');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (values) => {
    try {
      const response = await api.put("/api/profile", values);
      setProfileData(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      // Handle error (e.g., show error message)
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!profileData) return <div>Không có dữ liệu hồ sơ nào khả dụng. Vui lòng thử làm mới trang.</div>;


  const consultationColumns = [
    {
      title: 'Tên dự án',
      dataIndex: 'designName',
      key: 'designName',
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        record.status === 'PENDING' ? (
          <span>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ marginRight: '10px' }}
            />
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa yêu cầu này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </span>
        ) : null
      ),
    },
  ];

  const items = [
    {
      key: '1',
      label: 'Thông tin',
      children: (
        <div className="row">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6">
                <label>Họ và tên</label>
              </div>
              <div className="col-md-6">
                <p>{profileData?.fullName || user?.username || user?.email || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label>Email</label>
              </div>
              <div className="col-md-6">
                <p>{profileData?.email || user?.email || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label>Số điện thoại</label>
              </div>
              <div className="col-md-6">
                <p>{profileData?.phone || user?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label>Địa chỉ</label>
              </div>
              <div className="col-md-6">
                <p>{profileData?.address || user?.address || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Yêu cầu của tôi',
      children: (
        <div>
          <h3>Yêu cầu tư vấn của tôi</h3>
          <Table 
            dataSource={consultationRequests} 
            columns={consultationColumns} 
            rowKey="id"
          />
        </div>
      ),
    },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="profile-background">
      <div className="container emp-profile">
        <div className="row">
          <div className="col-md-10">
            <div className="profile-head">
              <h5>{profileData?.fullName || user?.username || user?.email}</h5>
              <h6>{profileData?.role || 'User'}</h6>
              <p className="proile-rating">
                Số dự án đã đặt: <span>{profileData?.projectCount || 0}</span>
              </p>
              <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
            </div>
          </div>
          <div className="col-md-2">
            <Button onClick={handleEditInfo} className="profile-edit-btn">
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Modal for editing profile */}
        <Modal
          visible={isEditing}
          title="Chỉnh sửa thông tin"
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={() => form.submit()}>
              Lưu
            </Button>,
          ]}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Modal for editing consultation request */}
        <Modal
          visible={!!editingRequest}
          title="Chỉnh sửa yêu cầu tư vấn"
          onCancel={() => setEditingRequest(null)}
          footer={[
            <Button key="cancel" onClick={() => setEditingRequest(null)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={() => editForm.submit()}>
              Cập nhật
            </Button>,
          ]}
        >
          <Form form={editForm} onFinish={handleEditSubmit} layout="vertical">
            <Form.Item name="designName" label="Tên dự án" rules={[{ required: true }]}>
              <Input readOnly/>
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="customerPhone" label="Số điện thoại khách hàng" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="customerAddress" label="Địa chỉ khách hàng" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default Profile;
