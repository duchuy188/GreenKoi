import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
} from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";
import api from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CustomDesignForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const navigate = useNavigate();
  // Custom Upload Adapter cho CKEditor (sao chép từ PondDesign)
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file.then((file) => {
        return new Promise((resolve, reject) => {
          const storageRef = ref(storage, `custom-design-images/${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {},
            (error) => {
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref)
                .then((downloadURL) => {
                  resolve({
                    default: downloadURL,
                  });
                })
                .catch((error) => {
                  reject(error);
                });
            }
          );
        });
      });
    }

    abort() {}
  }

  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const requestId = "YOUR_REQUEST_ID"; // Cần lấy requestId từ URL hoặc props
      const designValues = {
        id: crypto.randomUUID(),
        name: values.name,
        description: descriptionData,
        imageUrl: values.imageUrl,
        basePrice: Number(values.basePrice),
        shape: values.shape,
        dimensions: values.dimensions,
        features: values.features,
        // Các giá trị mặc định theo API schema
        createdById: "string",
        createdByName: "string",
        status: "IN_PROGRESS", // Thay đổi status thành IN_PROGRESS
        rejectionReason: "string",
        customerApprovedPublic: true,
        referenceDesignId: "string",
        referenceDesignName: "string",
        referenceDesignDescription: "string",
        designRequestId: requestId, // Thêm requestId vào đây
        projectId: "string",
        customerApprovalDate: "2024-11-09T11:20:50.035Z",
        createdAt: "2024-11-09T11:20:50.035Z",
        updatedAt: "2024-11-09T11:20:50.035Z",
        public: true,
        active: true,
        custom: true
      };

      // Cập nhật endpoint API
      await api.post(`/api/design-requests/${requestId}/design`, designValues);
      toast.success("Tạo thiết kế theo yêu cầu thành công");
      navigate("/dashboard/designproject");
      form.resetFields();
    } catch (err) {
      toast.error("Không thể tạo thiết kế theo yêu cầu: " + (err.response?.data?.message || "Đã xảy ra lỗi"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
       
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
            config={{
              extraPlugins: [MyCustomUploadAdapterPlugin],
              toolbar: [
                "heading",
                "|",
                "bold",
                "italic",
                "link",
                "|",
                "imageUpload",
                "|",
                "bulletedList",
                "numberedList",
                "|",
                "blockQuote",
                "undo",
                "redo",
              ],
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
          rules={[{ required: true, message: "Vui lòng nhập đặc trưng!" }]}
        >
          <Input.TextArea placeholder="Nhập đặc trưng" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo thiết kế theo yêu cầu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default CustomDesignForm; 