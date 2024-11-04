import { Button, Table, Popconfirm, Modal, Input, Image, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";

function PondDesignColumns() {
  const [pondDesigns, setPondDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");

  const fetchPendingPondDesigns = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/pond-designs/pending");
      if (Array.isArray(response.data)) {
        setPondDesigns(response.data);
      } else {
        toast.error(
          "Không thể tải thiết kế hồ. Cấu trúc dữ liệu không mong đợi."
        );
        setPondDesigns([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lấy thiết kế hồ.");
      setPondDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const approvePondDesign = async (id) => {
    try {
      await api.patch(`/api/pond-designs/${id}/approve`);
      toast.success("Chấp thuận thiết kế hồ thành công!");
      fetchPendingPondDesigns();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi chấp thuận thiết kế hồ."
      );
    }
  };

  const rejectPondDesign = async (id) => {
    try {
      await api.patch(`/api/pond-designs/${id}/reject`, {
        rejectionReason: rejectionReason,
      });
      toast.success("Từ chối thiết kế hồ thành công!");
      setRejectionReason("");
      fetchPendingPondDesigns();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi từ chối thiết kế hồ."
      );
    }
  };

  const showRejectModal = (id) => {
    setSelectedDesignId(id);
    setIsRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng cung cấp lý do từ chối.");
      return;
    }
    await rejectPondDesign(selectedDesignId);
    setIsRejectModalVisible(false);
  };

  const showDescriptionModal = (description) => {
    setCurrentDescription(description);
    setIsDescriptionModalVisible(true);
  };

  const PondDesignColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    { title: "Tên Hồ", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span>
          {text.slice(0, 5)}...
          <Button type="link" onClick={() => showDescriptionModal(text)}>
            Xem thêm
          </Button>
        </span>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) => (
        <Image
          src={url}
          alt="Pond Design"
          width={100}
          height={100}
          style={{ objectFit: "cover", marginTop: "5px" }}
          placeholder={
            <div
              style={{
                width: 100,
                height: 100,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f5f5f5",
              }}
            >
              Loading...
            </div>
          }
        />
      ),
    },
    { title: "Hình dáng", dataIndex: "shape", key: "shape" },
    { title: "Kích Thước", dataIndex: "dimensions", key: "dimensions" },
    {
      title: "Đặc Trưng",
      dataIndex: "features",
      key: "features",
      render: (text) => (
        <span>
          {text ? text.slice(0, 5) : "No features available"}...
          <Button type="link" onClick={() => showDescriptionModal(text)}>
            Xem thêm
          </Button>
        </span>
      ),
    },
    { title: "Giá", dataIndex: "basePrice", key: "basePrice" },
    { title: "Tạo bởi", dataIndex: "createdById", key: "createdById" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;
        switch (status) {
          case "PENDING_APPROVAL":
            color = "gold";
            text = "Đang chờ xử lý";
            break;
          default:
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
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
      <h1>Quản lý thiết kế hồ</h1>
      <Table
        dataSource={pondDesigns}
        columns={PondDesignColumns}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: "No pond designs pending approval." }}
      />
      <Modal
        title="Nhập lý do từ chối"
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        closable={true}
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
      <Modal
        title="Mô tả chi tiết"
        open={isDescriptionModalVisible}
        onCancel={() => setIsDescriptionModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsDescriptionModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div
            dangerouslySetInnerHTML={{ __html: currentDescription }}
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              textAlign: "justify",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default PondDesignColumns;
