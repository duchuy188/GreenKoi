import React, { useState, useEffect } from "react";
import axios from "../../../config/axios";
import { Table, Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import EditDesignModal from "./EditDesignModal";
import { toast } from "react-toastify";

function RequestDesign() {
  const [designRequests, setDesignRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentDesign, setCurrentDesign] = useState(null);

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "KHÁCH HÀNG",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "YÊU CẦU",
      dataIndex: "requirements",
      key: "requirements",
    },
    {
      title: "PHONG CÁCH",
      dataIndex: "preferredStyle",
      key: "preferredStyle",
    },
    {
      title: "NGÂN SÁCH",
      dataIndex: "budget",
      key: "budget",
      render: (text) => {
        const formattedBudget = new Intl.NumberFormat("vi-VN").format(text);
        return `${formattedBudget} VNĐ`;
      },
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let statusText = "Chờ xử lý";
        let color = "gold";

        switch (status) {
          case "PENDING":
            statusText = "Chờ xử lý";
            color = "gold";
            break;
          case "IN_PROGRESS":
            statusText = "Đang thực hiện";
            color = "blue";
            break;
          case "COMPLETED":
            statusText = "Hoàn thành";
            color = "green";
            break;
          case "PENDING_CUSTOMER_APPROVAL":
            statusText = "Chờ duyệt";
            color = "orange";
            break;
          case "APPROVED":
            statusText = "Đã duyệt";
            color = "green";
            break;
          default:
            break;
        }

        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: "LÝ DO TỪ CHỐI",
      dataIndex: "rejectionReason",
      key: "rejectionReason",
      render: (text, record) =>
        record.status === "IN_PROGRESS" && text ? text : "-",
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      render: (_, record) => {
         console.log("Record data:", record);
        return (
          record.status === "IN_PROGRESS" && (
            <Button
              type="primary"
              onClick={() => {
                console.log(
                  "Clicking with designId:",
                  record.designId,
                  "requestId:",
                  record.id
                );
                record.rejectionReason
                  ? handleEditClick(record.designId, record.id)
                  : navigate(`/dashboard/requestdesign/${record.id}`);
              }}
            >
              {record.rejectionReason ? "Chỉnh sửa thiết kế" : "Tạo thiết kế"}
            </Button>
          )
        );
      },
    },
  ];

  const fetchDesignRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("/api/design-requests/designer", config);
      const sortedRequests = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setDesignRequests(sortedRequests);
    } catch (error) {
      console.error("Error fetching design requests:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesignRequests();
  }, []);

  const handleEditClick = async (designId, requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/pond-designs/${designId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Design data:", response.data);

      setCurrentDesign({
        ...response.data,
        requestId: requestId,
      });
      setIsEditModalVisible(true);
    } catch (error) {
      console.error("Error fetching design:", error);
      toast.error("Không thể tải dữ liệu thiết kế");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Yêu cầu thiết kế</h1>
      <Table
        columns={columns}
        dataSource={designRequests}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
      />

      <EditDesignModal
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        designData={currentDesign}
        onSuccess={() => {
          setIsEditModalVisible(false);
          fetchDesignRequests();
        }}
      />
    </div>
  );
}

export default RequestDesign;
