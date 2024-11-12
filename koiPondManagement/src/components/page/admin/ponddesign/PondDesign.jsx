import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Card,
  Row,
  Col,
} from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase"; // Đường dẫn đến file firebase.js
import api from "../../../config/axios";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { toast } from "react-toastify";

function PondDesign() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pondData, setPondData] = useState(null);
  const [descriptionData, setDescriptionData] = useState(""); // State cho CKEditor

  const location = useLocation(); // Khai báo useLocation
  const navigate = useNavigate(); // Khai báo useNavigate

  useEffect(() => {
    if (location.state && location.state.pond) {
      setPondData(location.state.pond); // Lấy dữ liệu hồ từ state
      setDescriptionData(location.state.pond.description); // Gán mô tả cho CKEditor
      form.setFieldsValue(location.state.pond); // Gán giá trị cho form
    }
  }, [location.state, form]);

  // Custom Upload Adapter để tải ảnh lên Firebase
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file.then((file) => {
        return new Promise((resolve, reject) => {
          const storageRef = ref(storage, `pond-images/${file.name}`); // Sửa dấu backtick
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
                    default: downloadURL, // CKEditor sẽ sử dụng URL này để hiển thị ảnh
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
    setLoading(true);
    try {
      const pondValues = {
        ...values,
        description: descriptionData,
      };

      if (pondData) {
        await api.put(`/api/pond-designs/${pondData.id}`, pondValues);
        toast.success("Cập nhật thiết kế hồ thành công");
        navigate("/dashboard/designproject");
      } else {
        await api.post("/api/pond-designs", pondValues);
        toast.success("Tạo thiết kế hồ thành công");
        navigate("/dashboard/ponddesign");
      }
      form.resetFields();
      setDescriptionData("");
    } catch (err) {
      toast.error(
        "Không thể " +
          (pondData ? "cập nhật" : "tạo") +
          " thiết kế hồ: " +
          (err.response?.data?.message || "Đã xảy ra lỗi")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ maxWidth: 800, margin: "0 auto", padding: 24, marginLeft: "8%" }}
    >
      <h1>{pondData ? "Chỉnh sửa dự án hồ" : "Tạo dự án hồ"}</h1>
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
                rules={[
                  { required: true, message: "Vui lòng nhập hình dạng!" },
                ]}
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
                  min={5000}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
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
                rules={[
                  { required: true, message: "Vui lòng nhập kích thước!" },
                ]}
              >
                <Input placeholder="Nhập kích thước" />
              </Form.Item>
            </Col>
          </Row>

          {/* CKEditor cho mô tả */}
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
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
              { type: "url", message: "Vui lòng nhập một URL hợp lệ!" }, // Thêm điều kiện kiểm tra URL
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
              {pondData ? "Cập nhật thiết kế hồ" : "Tạo thiết kế hồ"}
            </Button>
            {pondData && ( // Chỉ hiển thị nút Hủy khi đang cập nhật (có pondData)
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  navigate("/dashboard/designproject");
                }}
              >
                Hủy
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default PondDesign;
