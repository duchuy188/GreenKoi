import { Button, Form, Input, Modal, Popconfirm, Table, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";

function CustomerMaintenance({ columns, formItems, path }) {
  const [datas, setDatas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState();
  const tableColumns = [
    ...columns,
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              setShowModal(true);
              form.setFieldsValue(record);
            }}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete"
            description="Do you want to delete"
            onConfirm={() => handleDelete(id)}
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>

          {record.status === "COMPLETED" && (
            <Button
              onClick={() => handleMaintenanceRequest(record)}
            >
              Request Maintenance
            </Button>
          )}
        </>
      ),
    },
  ];

  //GET
  const fetchData = async () => {
    try {
      const response = await api.get(path);
      setDatas(response.data);
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  //CREATE OR UPDATE
  const handleSubmit = async (values) => {
    console.log(values);
    try {
      setLoading(true);

      if (values.id) {
        // update
        const response = await api.put("${path}/${values.id}", values);
      } else {
        // neu co create
        const response = await api.post(path, values);
      }

      toast.success("Successfully");
      fetchData();
      form.resetFields();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      const response = await api.delete("${path}/${id}");
      toast.success("Successfully");
      fetchData();
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  const handleMaintenanceRequest = (record) => {
    setShowModal(true);
    form.setFieldsValue({
      projectId: record.id,
      // Pre-fill other fields as needed
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Button onClick={() => setShowModal(true)}>Add</Button>
      <Table dataSource={datas} columns={tableColumns} />

      <Modal
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
        }}
        title="Maintenance Request"
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          labelCol={{
            span: 24,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item name="projectId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input description" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="attachments" label="Attachments">
            <Input />
          </Form.Item>
          <Form.Item name="scheduledDate" label="Scheduled Date">
            <DatePicker />
          </Form.Item>
          {/* Add more form items as needed */}
        </Form>
      </Modal>
    </div>
  );
}

export default CustomerMaintenance;
