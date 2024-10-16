import React from 'react';
import { Result } from 'antd';

const AccessDenied = () => (
  <Result
    status="403"
    title="403"
    subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
  />
);

export default AccessDenied;
