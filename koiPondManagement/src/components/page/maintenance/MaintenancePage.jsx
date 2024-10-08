import React from 'react';
import './MaintenancePage.css';

const MaintenancePage = () => {
  const maintenanceData = [
    { category: "HẠNG MỤC 1: Kiểm Tra Sức Khỏe & Chăm Sóc Cá", items: [
      { id: 1, content: "Kiểm Tra Chất Lượng Vi Sinh Của Hồ", unit: "Số Lần", distance: "Dưới 10 km", price: 400000, total: 400000, note: "" },
      { id: 2, content: "Test độ PH, NH3, NO3 Trong Hồ", unit: "1", distance: "Từ 10-20 km", price: 500000, total: 500000, note: "" },
      // ... Thêm các mục khác của HẠNG MỤC 1
    ]},
    { category: "HẠNG MỤC 2: Kiểm Tra Vệ Sinh Hệ Thống Lọc", items: [
      { id: 1, content: "Vệ Sinh Sạch Sẽ Hệ Thống Lọc", unit: "1", distance: "Từ 5-10 m3", price: 600000, total: 600000, note: "" },
      { id: 2, content: "Chăm Mới Vi Sinh Cho Hồ Cá", unit: "1", distance: "Từ 10-20 m3", price: 800000, total: 800000, note: "" },
      // ... Thêm các mục khác của HẠNG MỤC 2
    ]},
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="maintenance-page">
      <h1>Bảng Báo Giá Dịch Vụ Vệ Sinh và Chăm Sóc Hồ Cá</h1>
      <p>Công ty TNHH Green KOI trân trọng cảm ơn quý khách đã quan tâm đến dịch vụ của công ty chúng tôi.</p>
      <p>Chúng tôi xin gửi đến khách hàng bảng báo giá dịch vụ của:</p>
      
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>NỘI DUNG CÔNG VIỆC</th>
            <th>ĐVT</th>
            <th>Khoảng cách</th>
            <th>ĐƠN GIÁ</th>
            <th>THÀNH TIỀN</th>
            <th>GHI CHÚ</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceData.map((category, index) => (
            <React.Fragment key={index}>
              <tr>
                <td colSpan="7" className="category">{category.category}</td>
              </tr>
              {category.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.content}</td>
                  <td>{item.unit}</td>
                  <td>{item.distance}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.total)}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenancePage;
