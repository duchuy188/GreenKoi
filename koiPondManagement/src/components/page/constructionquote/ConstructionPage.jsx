import React from 'react';
import { Link } from 'react-router-dom';
import './ConstructionPage.css'

const ConstructionPage = () => {
    return (
        <div className="construction-container">
          <h1>Bảng báo giá thi công hồ cá koi</h1>
          
          <p>Nếu bạn đam mê cá koi nên thi công phía nhà mình để thỏa mãn đam mê và có cá koi đẹp, bạn cần phải cân nhắc kỹ và tham khảo giá thành từ nhiều đơn vị thi công khác nhau trước.</p>
          
          <img src="https://storage.googleapis.com/digital-platform/hinh_anh_goi_y_15_mau_thiet_ke_ho_ca_Koi_dep_ai_nhin_cung_me_so_11_52813f4d65/hinh_anh_goi_y_15_mau_thiet_ke_ho_ca_Koi_dep_ai_nhin_cung_me_so_11_52813f4d65.jpg" alt="Hồ cá koi" className="koi-pond-image" />
          
          <p>Các yếu tố cần quan tâm khi thi công hồ cá koi: SGL Vietnam mời người xem tham khảo bài viết này. Bảng báo giá chi phí thi công hồ cá koi dưới đây là mức tham khảo. Chi phí thi công hồ cá koi phụ thuộc vào rất nhiều yếu tố: kích thước hồ, chủng loại cá koi, các kiểu cảnh đi kèm...</p>
          
          <h2>BÁO GIÁ THIẾT KẾ THI CÔNG HỒ CÁ KOI</h2>
          
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>DIỆN TÍCH</th>
                <th>ĐƠN GIÁ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>10 - 20 m2</td>
                <td>Từ 25.000.000/m2</td>
              </tr>
              <tr>
                <td>2</td>
                <td>20 - 50 m2</td>
                <td>Từ 21.000.000/m2</td>
              </tr>
              <tr>
                <td>3</td>
                <td>50 - 100 m2</td>
                <td>Từ 15.000.000/m2</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Trên 100 m2</td>
                <td>Từ 9.000.000/m2</td>
              </tr>
            </tbody>
          </table>
          
          <h3>Phạm vi công việc:</h3>
          <ul>
            <li>Đổ bê tông, chống thấm hoàn hảo, đầy đủ và nâng lọc</li>
            <li>Công tác M&E đấu nối điện nước đến vườn</li>
            <li>Hệ thống lọc</li>
            <li>Thi công kè đá nghệ thuật</li>
            <li>Thi công lắp đặt đèn đá Nhật</li>
            <li>Thi công sàn gỗ hầm lọc</li>
            <li>Thi công phối kết cây bụi và hoa tạo cảnh nghệ thuật</li>
            <li>Thi công cây tầm trung</li>
          </ul>
          <img src="https://sgl.com.vn/wp-content/uploads/2023/03/du-an-thiet-ke-thi-cong-san-vuon-biet-thu-go-vap-54-802x361.jpg" alt="Hồ cá koi" className="koi-pond-image" />
          <div className="detailed-quote-container">
            <Link to="/thiconghocakoi" className="detailed-quote-button">
              Mời xem ảnh mẫu (click vào đây)
            </Link>
          </div>
        </div>
      );
};

export default ConstructionPage;
