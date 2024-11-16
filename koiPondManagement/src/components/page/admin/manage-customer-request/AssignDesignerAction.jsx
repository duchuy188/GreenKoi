import React from 'react';
import { Button, Select, message, Modal } from 'antd';
import axios from '../../../config/axios';

const AssignDesignerAction = ({ requestId, onAssignSuccess }) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [designers, setDesigners] = React.useState([]);
  const [selectedDesigner, setSelectedDesigner] = React.useState(null);

  // Fetch designers list
  const fetchDesigners = async () => {
    try {
      const response = await axios.get("/api/manager/users");
      if (Array.isArray(response.data)) {
        const designerUsers = response.data.filter(
          (user) => user.roleId === "3"  // Lọc user có roleId là designer
        );
        setDesigners(
          designerUsers.map((user) => ({
            id: user.id,
            name: user.fullName || user.username,
          }))
        );
      } else {
        throw new Error("Unexpected data structure");
      }
    } catch (error) {
      console.error("Error fetching designers:", error);
      message.error("Không thể tải danh sách nhà thiết kế");
    }
  };

  const handleAssign = async () => {
    if (!selectedDesigner) {
      message.warning('Vui lòng chọn designer');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/design-requests/${requestId}/assign/${selectedDesigner}`);
      message.success('Phân công designer thành công');
      setIsModalVisible(false);
      if (onAssignSuccess) {
        await onAssignSuccess();
      }
    } catch (error) {
      console.error('Error assigning designer:', error);
      message.error('Không thể phân công designer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        type="primary"
        onClick={() => {
          setIsModalVisible(true);
          fetchDesigners();
        }}
      >
        Phân công
      </Button>

      <Modal
        title="Phân công nhân viên thiết kế"
        open={isModalVisible}
        onOk={handleAssign}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn nhân viên thiết kế"
          onChange={value => setSelectedDesigner(value)}
          options={designers.map(designer => ({
            value: designer.id,
            label: designer.name
          }))}
        />
      </Modal>
    </>
  );
};

export default AssignDesignerAction; 