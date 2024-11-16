import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
} from 'antd';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import axios from '../../../config/axios';
import { toast } from 'react-toastify';

function EditDesignModal({ 
  visible, 
  onCancel, 
  designData, 
  onSuccess 
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [descriptionData, setDescriptionData] = useState(designData?.description || "");

  const handleUpdateDesign = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!designData?.id) {
        throw new Error('Design ID không tồn tại');
      }

      const updatedDesignValues = {
        name: values.name,
        description: descriptionData,
        imageUrl: values.imageUrl,
        basePrice: Number(values.basePrice),
        shape: values.shape,
        dimensions: values.dimensions,
        features: values.features,
      };

      await axios.put(
        `/api/pond-designs/${designData.id}`,
        updatedDesignValues,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await axios.post(
        `/api/design-requests/${designData.requestId}/submit-review`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success("Cập nhật và gửi thiết kế thành công");
      onSuccess();
      onCancel();
    } catch (err) {
      console.error('Error details:', err.response);
      toast.error("Không thể cập nhật thiết kế: " + (err.response?.data?.message || "Đã xảy ra lỗi"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (designData && visible) {
      form.setFieldsValue({
        name: designData.name,
        shape: designData.shape,
        basePrice: designData.basePrice,
        dimensions: designData.dimensions,
        imageUrl: designData.imageUrl,
        features: designData.features,
      });
      setDescriptionData(designData.description);
    }
  }, [designData, visible, form]);

  return (
    <Modal
      title="Chỉnh sửa thiết kế"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdateDesign}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên hồ"
              rules={[{ required: true, message: "Vui lòng nhập tên hồ!" }]}
            >
              <Input placeholder="Nhập tên hồ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="shape"
              label="Hình dạng"
              rules={[{ required: true, message: "Vui lòng nhập hình dạng!" }]}
            >
              <Input placeholder="Nhập hình dạng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="basePrice"
              label="Giá cả"
              rules={[{ required: true, message: "Vui lòng nhập giá cả!" }]}
            >
              <InputNumber
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                style={{ width: "100%" }}
                placeholder="Nhập giá cả (VNĐ)"
                step={1000}
                addonAfter="VNĐ"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dimensions"
              label="Kích thước"
              rules={[{ required: true, message: "Vui lòng nhập kích thước!" }]}
            >
              <Input placeholder="Nhập kích thước" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <CKEditor
            editor={ClassicEditor}
            data={descriptionData}
            onChange={(event, editor) => {
              setDescriptionData(editor.getData());
            }}
          />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="Link ảnh bìa"
          rules={[
            { required: true, message: "Vui lòng nhập link hình ảnh!" },
            { type: "url", message: "Vui lòng nhập một URL hợp lệ!" },
          ]}
        >
          <Input.TextArea placeholder="Nhập link hình ảnh" />
        </Form.Item>

        <Form.Item
          name="features"
          label="Đặc trưng"
          rules={[{ required: true, message: "Vui lòng nhập đc trưng!" }]}
        >
          <Input.TextArea placeholder="Nhập đặc trưng" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật thiết kế
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditDesignModal; 