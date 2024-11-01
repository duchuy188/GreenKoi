import { Button, Result } from "antd";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGetParams from "../hooks/useGetParam";
import api from "../config/axios";

function SuccessPage() {
  const params = useGetParams();
  const orderID = params("orderID");
  const vnp_TransactionStatus = params("vnp_TransactionStatus");
  const vnp_Amount = params("vnp_Amount");
  const vnp_OrderInfo = params("vnp_OrderInfo");
  const vnp_TxnRef = params("vnp_TxnRef");
  console.log("orderID: ", orderID);
  console.log("vnp_TransactionStatus: ", vnp_TransactionStatus);
  console.log("Mã đơn hàng từ vnp_OrderInfo: ", vnp_OrderInfo);
  console.log("Mã đơn hàng từ vnp_TxnRef: ", vnp_TxnRef);
  console.log("Số tiền đã thanh toán: ", vnp_Amount);
  const nav = useNavigate();

  const postOrderID = async () => {
    try {
      const response = await api.post(`/api/payments/vnpay-return`);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (vnp_TransactionStatus === "00" || vnp_TransactionStatus === "01") {
      postOrderID();
    } else if (vnp_TransactionStatus === "02") {
      // Added condition for "02"
      nav("/error"); // Navigate to /error
    } else {
      // Failed
    }
  }, []);
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
        status="success"
        title="Thanh toán thành công"
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
                  {vnp_OrderInfo.split(": ")[1]}
                </span>
              </p>
              <p style={{ fontSize: "24px", margin: "10px 0" }}>
                Số tiền đã thanh toán:{" "}
                <span style={{ fontWeight: "normal" }}>{vnp_Amount}</span>
              </p>
              <p style={{ fontSize: "24px", margin: "10px 0" }}>
                Mã giao dịch:{" "}
                <span style={{ fontWeight: "normal" }}>{vnp_TxnRef}</span>
              </p>
            </div>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => {
              nav("/orders");
            }}
          >
            Xem đơn hàng
          </Button>,
        ]}
      />
    </div>
  );
}

export default SuccessPage;
