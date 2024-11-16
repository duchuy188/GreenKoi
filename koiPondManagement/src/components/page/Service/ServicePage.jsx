import React from 'react';
import { Link } from 'react-router-dom';
import './ServicePage.css';

const ServicePage = () => {
  return (
    <div className="service-container">     
      <div className="service-content">
        <aside className="service-sidebar">
          <h2>Nội dung chính</h2>
          <ul>
            <li><a href="#hinh-dang-ho">Hình dáng hồ</a></li>
            <li><a href="#vi-tri-dat-ho">Vị trí đặt hồ</a></li>
            <li><a href="#kich-thuoc-ho">Kích thước hồ</a></li>
            <li><a href="#muc-nuoc-trong-ho">Mực nước trong hồ</a></li>
            <li><a href="#he-thong-loc-nuoc">Hệ thống lọc nước và chất lượng nước</a></li>
          </ul>
        </aside>
        
        <main className="service-main">
          <section className="featured-service">
            <img src="https://images.unsplash.com/photo-1654225718758-79c6f724183a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Hồ cá Koi mẫu" />
            <p>Thiết kế hồ cá koi, hồ cá sân vườn, hồ cá mini, bể cá theo phong cách hiện đại. Đội ngũ kỹ sư có nhiều năm kinh nghiệm trong lĩnh vực thiết kế và thi công hồ cá koi, hồ cá sân vườn, hồ cá mini, bể cá. Chúng tôi cam kết mang đến cho quý khách hàng những sản phẩm chất lượng cao, đáp ứng mọi yêu cầu khắt khe nhất.</p>
            
            <h2>Cách thiết kế hồ nuôi cá koi đạt chuẩn</h2>
            <h3 id="hinh-dang-ho">1. Hình dáng hồ</h3>
            <p>Hình dáng hồ cá koi thường có dạng hình chữ nhật, hình tròn hoặc hình bầu dục. Tùy thuộc vào diện tích sân vườn, chúng ta có thể thiết kế hồ cá koi theo nhiều hình dáng khác nhau để phù hợp với không gian tổng thể.</p>
            <img src="https://canhquanngusac.com/content/uploads/2023/07/cay-trong-trang-tri-trong-ho-ca-koi-3.jpg" alt="Thiết kế hồ cá Koi" />
            <h3 id="vi-tri-dat-ho">2. Vị trí đặt hồ</h3>
            <p>Hồ cá Koi nên được đặt ở nơi có ánh sáng tự nhiên, tránh ánh nắng trực tiếp quá mức. Ngoài ra, hồ cá koi nên được đặt ở nơi thoáng mát, bớt gió, sạch sẽ, ít bụi. Tùy vào không gian sân vườn, chúng ta có thể đặt hồ cá ở nhiều vị trí khác nhau như: ở giữa sân vườn, cạnh nhà, gần cổng, dưới tán cây, ở góc sân, gần hiên nhà, v.v. Điều quan trọng là đảm bảo vị trí đặt hồ phù hợp với phong thủy và tạo điểm nhấn cho không gian tổng thể.</p>
            <img src="https://aquakoianphu.com/wp-content/uploads/306489823_154541117212110_5540536400736361009_n.jpg" alt="Vị trí đặt hồ cá Koi" />
            
            <h3 id="kich-thuoc-ho">3. Kích thước hồ</h3>
            <p>Kích thước hồ cá Koi cần được đảm bảo đạt đúng tiêu chuẩn nhất định như sau:</p>
            <ul>
              <li>Chiều cao tối thiểu của hồ cá Koi: Chiều sâu nên từ 1,2m trở lên để cá có thể hoạt động tự do, đặc biệt là trong mùa đông.</li>
              <li>Chiều rộng tối thiểu của hồ cá Koi: Ít nhất 1,8m để cá có thể bơi và quay đầu dễ dàng. Tùy thuộc vào chiều dài của cá mà có thể điều chỉnh cho phù hợp.</li>
              <li>Chiều dày đáy và thành hồ cá Koi: Tùy mỗi dạng cấu trúc để thiết kế độ dày phù hợp với hồ cá.</li>
            </ul>

            <h3 id="muc-nuoc-trong-ho">4. Mực nước trong hồ</h3>
            <p>Mức nước trong hồ cá Koi yêu cầu về mực nước khác nhau, cụ thể như sau:</p>
            <ul>
              <li>Hồ cá Koi nông mùa: Mực nước tối thiểu là 60 cm</li>
              <li>Hồ cá Koi ngâm hồ: Mực nước tối thiểu là 80 cm</li>
            </ul>

            <h3 id="he-thong-loc-nuoc">5. Hệ thống lọc nước và chất lượng nước</h3>
            <p>Bên cạnh độ mực nước cần chú ý đến chất lượng nước trong hồ. Vì thế cần có một hệ thống lọc được thiết kế tốt, công suất lớn để đảm bảo chất lượng nước trong hồ. Một số yếu tố cần quan tâm:</p>
            <ul>
              <li>Hệ thống lọc cơ học: Loại bỏ các chất rắn và cặn bã</li>
              <li>Hệ thống lọc sinh học: Chuyển hóa các chất độc hại thành chất ít độc hơn</li>
              <li>Kiểm soát pH: Duy trì pH ở mức 6.5-8.5</li>
              <li>Oxy hòa tan: Đảm bảo đủ oxy cho cá thở</li>
            </ul>

            <img src="https://canhquanhoanggia.com/sites/default/files/5Hocakoi/5868234568.jpg" alt="Hệ thống lọc nước hồ cá Koi" />

            {/* Thêm nội dung chi tiết về các yếu tố khác nếu cần */}

            {/* Add this button after the existing content */}
            <div className="quote-button-container">
              <Link to="/baogiathicong" className="quote-button">
                Mời xem bảng báo giá chi tiết (click vào đây)
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ServicePage;
