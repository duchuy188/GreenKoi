import React from 'react';
import './MaintenancePage.css';


const MaintenancePage = () => {
  const maintenanceData = [
    { category: "HẠNG MỤC 1: Kiểm Tra Sức Khỏe & Chăm Sóc Cá", items: [
      { id: 1, content: "Kiểm Tra Chất Lượng Vi Sinh Của Hồ", unit: "Số Lần", distance: "Dưới 10 m", price: 400000, total: 400000, note: "" },
      { id: 2, content: "Test độ PH, NH3, NO3 Trong Hồ", unit: "1", distance: "Từ 10-20 m", price: 500000, total: 500000, note: "" },
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
      <h2>Vì sao cần bảo trì, bảo dưỡng, chăm sóc hồ Koi</h2>
      <p>Như đã đề cập ở phần đầu, thú chơi cá Koi không chỉ tốn kém mà còn cần sự chăm sóc kỹ lưỡng, cẩn thận. Cá Koi có sức đề kháng kém hơn cá chép thông thường. Nếu môi trường nước bị nhiễm bẩn, cá Koi dễ mắc bệnh và lây cho nhau. Hơn nữa các thiết bị hồ Koi như tấm lọc nước, bình oxy cũng cần được thay thế hay kiểm mới thường xuyên.</p>
      <img src="https://bizweb.dktcdn.net/thumb/grande/100/307/111/files/thiet-ke-ho-ca-koi-22-0bdeee07-74d0-4261-b29e-e55834d6b595.jpg?v=1530180215466" />
      
      <p><em>Bảo trì, bảo dưỡng, chăm sóc hồ Koi giúp cá Koi luôn khỏe mạnh</em></p>

      <p>Nếu bạn mới chơi cá Koi hoặc không có thời gian chăm sóc chúng thì dịch vụ bảo trì, bảo dưỡng, chăm sóc hồ Koi chính là lựa chọn lý tưởng. Tất cả những gì bạn cần làm là mua cá Koi và chơi với chúng mỗi ngày, việc còn lại hãy để GreenKoi giúp bạn.</p>

      <p>Tại GreenKoi, chúng tôi có đội ngũ nhân viên giàu kinh nghiệm nuôi dưỡng, chăm sóc cá Koi. Cá chính là người bạn của GreenKoi và chúng tôi luôn hiểu bạn của mình cần những gì để khỏe mạnh.</p>

      <h2>Bảo trì, bảo dưỡng, chăm sóc hồ Koi thường diễn ra bao lâu 1 lần?</h2>
      <p>Thông thường, một hồ cá Koi đã đi vào hoạt động sẽ cần phải đảm bảo các tiêu chuẩn về diện tích, độ sâu, lượng nước, chất lượng của nước. Những hồ Koi mới cần có sự kiểm tra, đo chất lượng nước, môi trường sống ngay từ đầu. GreenKoi sẵn sàng đồng hành cùng bạn ngay từ khi bắt đầu chơi cá Koi.</p>

      <p>Chúng tôi thực hiện dịch vụ với hai gói cơ bản:</p>
      <ul>
        <li><strong>Gói bán lẻ:</strong> Với gói này, GreenKoi sẽ cử chuyên viên đến tận hồ Koi của khách hàng khi có yêu cầu.</li>
        <li><strong>Gói 4 mùa:</strong> Đây là dịch vụ trọn gói được nhiều khách hàng của GreenKoi sử dụng. Chúng tôi sẽ có lịch đến kiểm tra, bảo dưỡng và chăm sóc cá định kỳ. Việc này giúp cho đàn cá luôn được kiểm soát về sức khỏe và môi trường sống.</li>
      </ul>

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
