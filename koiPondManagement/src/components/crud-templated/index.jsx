import { Button, Form, Input, Modal, Popconfirm, Table } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";

function CrudTemplate({ columns, formItems, path }) {
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
      render: (id, category) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              setShowModal(true);
              form.setFieldValue(category);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Button onClick={() => setShowModal(true)}>Add</Button>
      <Table dataSource={datas} columns={tableColumns} />

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title="Category"
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
          {formItems}

          {/* <Form.Item name="id" hidden>
            <Input/>
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please input category's name!" },
            ]}
          >
            <Input/>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
}

export default CrudTemplate;
