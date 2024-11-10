import { Button, Result, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetParams from "../hooks/useGetParam";
import api from "../config/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SuccessPage() {
  const params = useGetParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  // Lấy các params từ VNPay
  const vnp_ResponseCode = params("vnp_ResponseCode");
  const vnp_Amount = params("vnp_Amount");
  const vnp_OrderInfo = params("vnp_OrderInfo");
  const vnp_TxnRef = params("vnp_TxnRef");
  const vnp_BankCode = params("vnp_BankCode");
  const vnp_PayDate = params("vnp_PayDate");
  const vnp_TransactionNo = params("vnp_TransactionNo");
  const vnp_CardType = params("vnp_CardType");
  const vnp_BankTranNo = params("vnp_BankTranNo");

  const verifyPayment = async () => {
    try {
      setLoading(true);

      // Gửi đầy đủ thông tin payment để verify
      const paymentData = {
        vnp_ResponseCode,
        vnp_Amount,
        vnp_OrderInfo,
        vnp_TxnRef,
        vnp_BankCode,
        vnp_PayDate,
        vnp_TransactionNo,
        vnp_CardType,
        vnp_BankTranNo,
      };

      console.log("Sending payment data for verification:", paymentData);

      const response = await api.post(
        "/api/payments/verify-payment",
        paymentData
      );
      console.log("Payment verification response:", response.data);

      if (response.data.success) {
        setVerified(true);
        toast.success("Thanh toán đã được xác nhận thành công!");
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Có lỗi xảy ra khi xác nhận thanh toán");
      setTimeout(() => nav("/error"), 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!vnp_ResponseCode || !vnp_TxnRef) {
      toast.error("Thiếu thông tin thanh toán");
      nav("/error");
      return;
    }

    if (vnp_ResponseCode === "00") {
      verifyPayment();
    } else {
      toast.error("Thanh toán thất bại");
      nav("/error");
    }
  }, [vnp_ResponseCode, vnp_TxnRef]);

  useEffect(() => {
    console.log("vnp_OrderInfo:", vnp_OrderInfo);
    console.log("includes maintenance:", vnp_OrderInfo?.includes("maintenance"));
  }, [vnp_OrderInfo]);

  const handleViewOrders = () => {
    toast.info("Đang chuyển hướng...");
    setTimeout(() => {
      nav("/orders", {
        state: {
          paymentSuccess: true,
          paymentType: vnp_OrderInfo?.includes("project")
            ? "PROJECT"
            : "MAINTENANCE",
        },
      });
    }, 800);
  };

  const handleViewMaintenanceProfile = () => {
    toast.info("Đang chuyển hướng đến hồ sơ bảo trì...");
    setTimeout(() => {
      nav("/maintenanceProfile", {
        state: {
          paymentSuccess: true,
          orderId: vnp_OrderInfo?.split(": ")[1] || vnp_TxnRef
        },
      });
    }, 800);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang xác nhận thanh toán...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Result
        status={verified ? "success" : "error"}
        title={verified ? "Thanh toán thành công" : "Đang xác nhận thanh toán"}
        subTitle={
          <div style={{ textAlign: "center", fontSize: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <p style={{ fontSize: "24px", margin: "10px 0" }}>
                Mã đơn hàng:{" "}
                <span style={{ fontWeight: "normal" }}>
                  {vnp_OrderInfo?.split(": ")[1] || vnp_TxnRef}
                </span>
              </p>
              <p style={{ fontSize: "24px", margin: "10px 0" }}>
                Số tiền đã thanh toán:{" "}
                <span style={{ fontWeight: "normal" }}>
                  {(parseInt(vnp_Amount) / 100).toLocaleString("vi-VN")} VNĐ
                </span>
              </p>
              <p style={{ fontSize: "24px", margin: "10px 0" }}>
                Mã giao dịch:{" "}
                <span style={{ fontWeight: "normal" }}>{vnp_TxnRef}</span>
              </p>
              {vnp_BankCode && (
                <p style={{ fontSize: "24px", margin: "10px 0" }}>
                  Ngân hàng:{" "}
                  <span style={{ fontWeight: "normal" }}>{vnp_BankCode}</span>
                </p>
              )}
            </div>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={handleViewOrders}
            disabled={!verified}
          >
            Xem đơn hàng
          </Button>,
          <Button 
            type="default" 
            key="maintenance"
            onClick={handleViewMaintenanceProfile}
            disabled={!verified}
          >
            Xem hồ sơ bảo trì
          </Button>
        ]}
      />
    </div>
  );
}

export default SuccessPage;
