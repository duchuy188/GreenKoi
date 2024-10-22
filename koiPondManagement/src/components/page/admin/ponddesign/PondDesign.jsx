import React, { useState } from "react";
import { Form, Input, InputNumber, Button, message, Card, Row, Col } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";  // Đường dẫn đến file firebase.js
import api from "../../../config/axios";

function PondDesign() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pondData, setPondData] = useState(null);
  const [descriptionData, setDescriptionData] = useState(""); // State cho CKEditor

  // Custom Upload Adapter để tải ảnh lên Firebase
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file
        .then((file) => {
          return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `pond-images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
              "state_changed",
              (snapshot) => {
                // Có thể thêm phần xử lý progress nếu cần
              },
              (error) => {
                reject(error);
              },
              () => {
                getDownloadURL(uploadTask.snapshot.ref)
                  .then((downloadURL) => {
                    resolve({
                      default: downloadURL,  // CKEditor sẽ sử dụng URL này để hiển thị ảnh
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

    abort() {
      // Optional: xử lý abort nếu cần
    }
  }

  // Plugin để tích hợp upload adapter vào CKEditor
  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  // Handle form submission (create or update)
  const handleSubmit = async (values) => {
    setLoading(true); // Set loading khi bắt đầu submit
    try {
      const pondValues = {
        ...values,
        description: descriptionData, // Gán giá trị mô tả từ CKEditor
      };

      if (pondData) {
        // Update existing pond design
        console.log("Updating pond design with ID:", pondData.id);
        await api.put(`/api/pond-designs/${pondData.id}`, pondValues);
        message.success("Pond design updated successfully");
        setPondData(null);
      } else {
        // Create new pond design
        await api.post("/api/pond-designs", pondValues);
        message.success("Pond design created successfully");
      }
      form.resetFields();
      setDescriptionData(""); // Reset CKEditor
    } catch (err) {
      message.error("Failed to " + (pondData ? "update" : "create") + " pond design: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false); // Set loading về false sau khi hoàn tất
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, marginLeft: "8%" }}>
      <Card title={pondData ? "Edit Pond Design" : "Create Pond Design"} bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Enter pond name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shape" label="Shape" rules={[{ required: true }]}>
                <Input placeholder="Enter pond shape" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="basePrice" label="Base Price" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Enter base price" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dimensions" label="Dimensions" rules={[{ required: true }]}>
                <Input placeholder="Enter pond dimensions" />
              </Form.Item>
            </Col>
          </Row>

          {/* CKEditor cho mô tả */}
          <Form.Item label="Description" rules={[{ required: true }]}>
            <CKEditor
              editor={ClassicEditor}
              data={descriptionData}
              onChange={(event, editor) => {
                const data = editor.getData();
                setDescriptionData(data);
              }}
              config={{
                extraPlugins: [MyCustomUploadAdapterPlugin], // Thêm plugin upload adapter
                toolbar: [
                  "heading", "|",
                  "bold", "italic", "link", "|",
                  "imageUpload", "|",
                  "bulletedList", "numberedList", "|",
                  "blockQuote", "undo", "redo",
                ],
              }}
            />
          </Form.Item>

          <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter pond image URL" />
          </Form.Item>

          <Form.Item name="features" label="Features" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter pond features" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {pondData ? "Update Pond Design" : "Create Pond Design"}
            </Button>
            {pondData && (
              <Button style={{ marginLeft: 8 }} onClick={() => {
                setPondData(null);
                form.resetFields();
                setDescriptionData(""); // Reset CKEditor
              }}>
                Cancel Edit
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default PondDesign;
