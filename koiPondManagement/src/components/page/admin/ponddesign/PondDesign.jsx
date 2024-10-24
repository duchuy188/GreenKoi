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
        message.success("Cập nhật thiết kế hồ thành công");
        setPondData(null);
      } else {
        // Create new pond design
        await api.post("/api/pond-designs", pondValues);
        message.success("Tạo thiết kế hồ thành công");
      }
      form.resetFields();
      setDescriptionData(""); // Reset CKEditor
    } catch (err) {
      message.error("Không thể " + (pondData ? "cập nhật" : "tạo") + " thiết kế hồ: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false); // Set loading về false sau khi hoàn tất
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, marginLeft: "8%" }}>
      <h1>Tạo dự án hồ</h1>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên hồ" rules={[{ required: true, message: "Vui lòng nhập tên hồ!" }]}>
                <Input placeholder="Nhập tên hồ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shape" label="Hình dạng" rules={[{ required: true, message: "Vui lòng nhập hình dạng!"}]}>
                <Input placeholder="Nhập hình dạng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="basePrice" label="Giá cả" rules={[{ required: true, message: "Vui lòng nhập giá cả!"}]}>
                <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Nhập giá cả" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dimensions" label="Kích thước" rules={[{ required: true, message: "Vui lòng nhập kích thước!"}]}>
                <Input placeholder="Nhập kích thước" />
              </Form.Item>
            </Col>
          </Row>

          {/* CKEditor cho mô tả */}
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả!"}]}>
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

          <Form.Item name="imageUrl" label="Link ảnh bìa" rules={[{ required: true, message: "Vui lòng nhập link hình ảnh!" }]}>
            <Input.TextArea placeholder="Nhập link hình ảnh" />
          </Form.Item>

          <Form.Item name="features" label="Đặc trưng" rules={[{ required: true, message: "Vui lòng nhập đặc trưng!"}]}>
            <Input.TextArea placeholder="Nhập đặc trưng" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {pondData ? "Update Pond Design" : "Tạo thiết kế hồ"}
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
