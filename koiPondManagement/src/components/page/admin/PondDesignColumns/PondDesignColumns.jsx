import { Button, Table, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";

function PondDesignColumns() {
  const [pondDesigns, setPondDesigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingPondDesigns = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/pond-designs/pending");
      if (Array.isArray(response.data)) {
        setPondDesigns(response.data);
      } else {
        toast.error("Failed to load pond designs. Unexpected data structure.");
        setPondDesigns([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching pond designs.");
      setPondDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const approvePondDesign = async (id) => {
    try {
      await api.patch(`/api/pond-designs/${id}/approve`);
      toast.success("Pond design approved successfully!");
      fetchPendingPondDesigns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error approving pond design.");
    }
  };

  const rejectPondDesign = async (id) => {
    try {
      await api.patch(`/api/pond-designs/${id}/reject`);
      toast.success("Pond design rejected successfully!");
      fetchPendingPondDesigns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error rejecting pond design.");
    }
  };

  const PondDesignColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Image", dataIndex: "imageUrl", key: "imageUrl", render: (url) => <img src={url} alt="Pond Design" style={{ width: 100 }} /> },
    { title: "Shape", dataIndex: "shape", key: "shape" },
    { title: "Dimensions", dataIndex: "dimensions", key: "dimensions" },
    { title: "Features", dataIndex: "features", key: "features" },
    { title: "BasePrice", dataIndex: "basePrice", key: "basePrice" },
    { title: "Created By", dataIndex: "createdById", key: "createdById" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        switch (status) {
          case "PENDING_APPROVAL":
            return "Đang chờ xử lý";
          case "APPROVED":
            return "Đã chấp nhận";
          case "REJECTED":
            return "Đã từ chối";
          default:
            return status;
        }
      },
    },
    {
      title: "Action", dataIndex: "id", key: "id", render: (id) => (
        <>
          <Popconfirm title="Approve this design?" onConfirm={() => approvePondDesign(id)}>
            <Button type="primary" style={{ marginRight: 8 }}>Chấp nhận</Button>
          </Popconfirm>
          <Popconfirm title="Reject this design?" onConfirm={() => rejectPondDesign(id)}>
            <Button type="danger">Không chấp nhận</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchPendingPondDesigns();
  }, []);

  return (
    <div>
      <Table
        dataSource={pondDesigns}
        columns={PondDesignColumns}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: "No pond designs pending approval." }}
      />
    </div>
  );
}

export default PondDesignColumns;
