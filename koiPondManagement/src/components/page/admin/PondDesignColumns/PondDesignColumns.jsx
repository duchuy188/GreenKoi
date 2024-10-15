import { Button, Table, Popconfirm, Modal, Input } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";

function PondDesignColumns() {
  const [pondDesigns, setPondDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
      toast.error(
        err.response?.data?.message || "Error fetching pond designs."
      );
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
      toast.error(
        err.response?.data?.message || "Error approving pond design."
      );
    }
  };

  const rejectPondDesign = async (id) => {
    try {
      await api.patch(`/api/pond-designs/${id}/reject`, {
        reason: rejectionReason,
      });
      toast.success("Pond design rejected successfully!");
      setRejectionReason("");
      fetchPendingPondDesigns();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error rejecting pond design."
      );
    }
  };

  const showRejectModal = (id) => {
    setSelectedDesignId(id);
    setIsRejectModalVisible(true);
  };

  const handleReject = async () => {
    await rejectPondDesign(selectedDesignId);
    setIsRejectModalVisible(false);
  };

  const PondDesignColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên Hồ", dataIndex: "name", key: "name" },
    { title: "Miêu tả", dataIndex: "description", key: "description" },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) => (
        <img src={url} alt="Pond Design" style={{ width: 100 }} />
      ),
    },
    { title: "Hình dáng", dataIndex: "shape", key: "shape" },
    { title: "Kích Thước", dataIndex: "dimensions", key: "dimensions" },
    { title: "Đặc Trưng", dataIndex: "features", key: "features" },
    { title: "Giá", dataIndex: "basePrice", key: "basePrice" },
    { title: "Tạo bởi", dataIndex: "createdById", key: "createdById" },
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
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <>
          <Popconfirm
            title="Bạn có chấp thuận thiết kế này không?"
            onConfirm={() => approvePondDesign(id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="primary" style={{ marginRight: 8 }}>
              Chấp nhận
            </Button>
          </Popconfirm>
          <Button type="primary" danger onClick={() => showRejectModal(id)}>
            Không chấp nhận
          </Button>
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
      <Modal
        title="Nhập lý do từ chối"
        open={isRejectModalVisible} // Thay visible bằng open
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Hãy nhập lý do từ chối..."
        />
      </Modal>
    </div>
  );
}

export default PondDesignColumns;
