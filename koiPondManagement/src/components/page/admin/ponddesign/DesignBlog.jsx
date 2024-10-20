import React, { useState } from "react";
import { Form, Input, Button, message, Card, Modal } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import api from "../../../config/axios";

function DesignBlog() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editorData, setEditorData] = useState("");

  // Handle form submission (create blog draft)
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Create new blog draft
      await api.post("/api/blog/drafts", { ...values, content: editorData });
      message.success("Blog draft created successfully");
      form.resetFields();
      setEditorData("");
      setModalVisible(false);
    } catch (err) {
      message.error("Failed to create blog draft: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Open modal to confirm submitting the blog draft
  const openSubmitModal = (post) => {
    setSelectedPost(post);
    setSubmitModalVisible(true);
  };

  // Handle blog draft submission
  const handleSubmitBlog = async () => {
    if (!selectedPost) return;
    try {
      await api.post(`/api/blog/drafts/${selectedPost.id}/submit`);
      message.success("Blog submitted successfully");
      setSubmitModalVisible(false);
      setSelectedPost(null);
    } catch (err) {
      message.error("Failed to submit blog: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Card title="Create Blog Draft" bordered={false} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item label="Content" rules={[{ required: true }]}>
            <CKEditor
              editor={ClassicEditor}
              data={editorData}
              onChange={(event, editor) => {
                const data = editor.getData();
                setEditorData(data);
              }}
              config={{
                // Configure the editor here
                ckfinder: {
                  // Upload image to server
                  uploadUrl: '/api/upload', // Your upload URL
                },
                // Enable the image upload feature
                toolbar: [
                  'heading', '|',
                  'bold', 'italic', 'link', '|',
                  'imageUpload', '|',
                  'bulletedList', 'numberedList', '|',
                  'blockQuote', 'undo', 'redo'
                ],
              }}
            />
          </Form.Item>

          <Form.Item name="coverImageUrl" label="Image URL" rules={[{ required: true }]}>
            <Input placeholder="Enter blog image URL" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Blog Draft
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Submit confirmation modal */}
      <Modal
        title="Submit Blog"
        visible={submitModalVisible}
        onOk={handleSubmitBlog}
        onCancel={() => setSubmitModalVisible(false)}
      >
        <p>Are you sure you want to submit this blog?</p>
      </Modal>
    </div>
  );
}

export default DesignBlog;