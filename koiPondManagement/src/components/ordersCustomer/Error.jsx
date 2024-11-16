import React from "react";
import { Button, Result, Typography } from "antd";
import { useNavigate } from "react-router-dom";

function Error() {
  const nav = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Result
        status="error"
        title="Thanh toán không thành công"
        subTitle={
          <div style={{ fontSize: "24px" }}>
            Vui lòng kiểm tra thông tin và thanh toán lại.
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="retry"
            onClick={() => {
              nav("/orders");
            }}
          >
            Thanh toán lại
          </Button>,
          <Button
            type="primary"
            key="back"
            onClick={() => {
              nav("/maintenanceProfile");
            }}
          >
            Xem hồ sơ bảo trì
          </Button>,
        ]}
      />
    </div>
  );
}

export default Error;
