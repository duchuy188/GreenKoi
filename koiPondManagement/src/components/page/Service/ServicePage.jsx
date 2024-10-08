import React from 'react';
import './ServicePage.css';

const ServicePage = () => {
  return (
    <div className="service-container">     
      <div className="service-content">
        <aside className="service-sidebar">
          <h2>Nội dung chính</h2>
          <ul>
            <li>Cách thiết kế hồ cá koi</li>
            <li>Thiết kế hồ cá koi</li>
            <li>Thiết kế hồ cá sân vườn</li>
            <li>Thiết kế hồ cá mini, bể cá</li>
            <li>Bơm lọc thiết kế phối cảnh</li>
            <li>Thiết kế hồ cá hồ cảnh</li>
            <li>Công trình hồ cá koi</li>
            <li>Thiết kế hồ cá mini đẹp</li>
            <li>Thiết kế hồ cá biệt thự</li>
            <li>Thiết kế hồ cá trong nhà</li>
            <li>Lọc thùng sàn, lọc mương</li>
            <li>Quy trình xây hồ cá koi</li>
            <li>Cách dự trù hồ cá koi</li>
          </ul>
        </aside>
        
        <main className="service-main">
          <section className="featured-service">
            <img src="https://sgl.com.vn/wp-content/uploads/2023/09/du-an-thiet-ke-thi-cong-san-vuon-biet-thu-go-vap-95-802x535.jpg" alt="Hồ cá Koi mẫu" />
            <p>Thiết kế hồ cá koi, hồ cá sân vườn, hồ cá mini, bể cá theo phong cách hiện đại. Đội ngũ kỹ sư có nhiều năm kinh nghiệm trong lĩnh vực thiết kế và thi công hồ cá koi, hồ cá sân vườn, hồ cá mini, bể cá. Chúng tôi cam kết mang đến cho quý khách hàng những sản phẩm chất lượng cao, đáp ứng mọi yêu cầu khắt khe nhất.</p>
            
            <h2>Cách thiết kế hồ nuôi cá koi đạt chuẩn</h2>
            <h3>1. Hình dáng hồ</h3>
            <p>Hình dáng hồ cá koi thường có dạng hình chữ nhật, hình tròn hoặc hình bầu dục. Tùy thuộc vào diện tích sân vườn, chúng ta có thể thiết kế hồ cá koi theo nhiều hình dáng khác nhau để phù hợp với không gian tổng thể.</p>
            <img src="https://sgl.com.vn/wp-content/uploads/2023/03/du-an-thiet-ke-thi-cong-san-vuon-biet-thu-go-vap-14-802x452.jpg" alt="Thiết kế hồ cá Koi" />
            <h3>2. Vị trí đặt hồ</h3>
            {/* Thêm nội dung chi tiết về vị trí đặt hồ */}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ServicePage;
