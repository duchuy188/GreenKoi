import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/firebase";
import api from "../../../config/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function DesignBlog() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [designData, setDesignData] = useState(null);
  const [descriptionData, setDescriptionData] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.design) {
      const design = location.state.design;
      setDesignData(design);
      setDescriptionData(design.content || "");
      form.setFieldsValue({
        title: design.title,
        coverImageUrl: design.coverImageUrl,
      });
    }
  }, [location.state, form]);

  // Custom Upload Adapter
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file.then((file) => {
        return new Promise((resolve, reject) => {
          const storageRef = ref(storage, `blog-images/${file.name}`);
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
      if (!descriptionData.trim()) {
        toast.error("Vui lòng nhập nội dung bài viết!");
        setLoading(false);
        return;
      }

      const designValues = {
        title: values.title.trim(),
        content: descriptionData,
        status: "DRAFT",
        coverImageUrl: values.coverImageUrl.trim(),
        type: "BLOG",
      };

      let response;
      if (designData && designData.id) {
        // Update existing blog
        const updateUrl = `/api/blog/drafts/${designData.id}`;

        try {
          response = await api.put(updateUrl, designValues);

          if (response.data) {
            toast.success("Cập nhật bài viết thành công");
            form.resetFields();
            setDescriptionData("");
            navigate("/dashboard/blogproject"); // Giữ nguyên redirect khi cập nhật
          }
        } catch (error) {
          console.error("PUT request error:", error);
          throw error;
        }
      } else {
        // Create new blog
        const createUrl = "/api/blog/drafts";

        response = await api.post(createUrl, designValues);

        if (response.data) {
          toast.success("Tạo bài viết thành công");
          form.resetFields(); // Reset form
          setDescriptionData(""); // Reset content
          // Bỏ dòng navigate("/dashboard/blogproject") để ở lại trang hiện tại
        }
      }
    } catch (err) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error:", err);
      console.error("Response:", err.response);

      let errorMessage = "Đã có lỗi xảy ra";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(
        "Không thể " +
          (designData ? "cập nhật" : "tạo") +
          " bài viết: " +
          errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ maxWidth: 800, margin: "0 auto", padding: 24, marginLeft: "8%" }}
    >
      <h1>{designData ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h1>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          >
            <CKEditor
              editor={ClassicEditor}
              data={descriptionData}
              onChange={(event, editor) => {
                const data = editor.getData();
                setDescriptionData(data);
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
            name="coverImageUrl"
            label="Link ảnh bìa"
            rules={[
              { required: true, message: "Vui lòng nhập link hình ảnh!" },
              { type: "url", message: "Vui lòng nhập một URL hợp lệ!" },
            ]}
          >
            <Input.TextArea placeholder="Nhập link hình ảnh" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {designData ? "Cập nhật bài viết" : "Tạo bài viết"}
            </Button>
            {designData && (
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setDesignData(null);
                  form.resetFields();
                  setDescriptionData("");
                  navigate("/dashboard/blogproject");
                }}
              >
                Hủy chỉnh sửa
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default DesignBlog;
