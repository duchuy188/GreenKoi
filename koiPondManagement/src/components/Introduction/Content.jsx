import React from "react";
import { Link } from 'react-router-dom';
import "./Content.css";

const Content = () => {
  return (
    <div className="introduction-container">
      <header className="hero-section">
        <h1>Green Koi</h1>
        <p className="subtitle">Thiết kế hồ cá Koi đẳng cấp và chuyên nghiệp</p>
      </header>

      <section className="about-section">
        <h2>Về Green Koi</h2>
        <p>
          Tại Green Koi, chúng tôi cam kết mang đến những thiết kế hồ cá
          Koi tinh tế và bền vững, hài hòa với không gian sống.
        </p>
        <p>
          Green Koi chuyên cung cấp dịch vụ tư vấn, thiết kế và thi công
          hồ cá Koi phong cách đa dạng và hấp dẫn. Chúng tôi sở hữu đội ngũ chuyên
          gia giàu kinh nghiệm và luôn cập nhật những xu hướng thiết kế
          mới nhất để mang lại sự hài lòng tối đa cho khách hàng. Các dự
          án của chúng tôi luôn chú trọng đến chất lượng, tính thẩm mỹ, và
          sự phù hợp với không gian sống.
        </p>
        <p>
          Với nhiều năm kinh nghiệm trong ngành chúng tôi đã xây dựng được thương hiệu qua nhiều công trình lớn
          nhỏ khác nhau trên khắp cả nước từ khâu khảo sát, thiết kế cho đến thi công lắp đặt và hoàn thiện tất cả
          những công trình. Áp dụng tiêu chí " Chất lượng và sự hài lòng của quý khách hàng là sự uy tín của chúng tôi",
          tiêu chí luôn được thể hiện đi đôi với độ thẩm mỹ cao, an toàn tuyệt đối ngay tại công trình và nhiệt huyết
          trong dịch vụ tư vấn khách hàng.
        </p>
        <p>
          Về toàn thể nhân viên của Green Koi luôn hoàn thành công việc tốt trong nội bộ và với khách
          hàng của mình ngay từ lúc tư vấn khảo sát cho đến lúc hoàn thiện công trình thông qua các kỹ năng, kỹ
          thuật, tinh chuyên nghiệp và cam kết uy tín. Bởi thế chúng tôi đã hoàn thiện rất nhiều công trình chất lượng
          cao nhất so với những đơn vị khác hiện nay.
        </p>
        <p>
          Green Koi hiện đang có một đội ngũ nhân viên trẻ nhiệt tình, giàu kinh nghiệm, có kỹ năng
          chuyên sâu trong lĩnh vực thi công xây dựng, thiết kế thi công sân vườn tiểu cảnh. Thiết kế – thi công hồ cá koi,
          thi công công trình cây xanh, công viên đô thị. Tư vấn chăm sóc và cung cấp các dòng Cá Koi Nhật và Cá Koi
          Việt đẹp. Đặc biệt đội ngũ nhân viên chúng luôn được đào tạo thực tế qua nhiều công trình lớn nhỏ từ khâu kỹ
          thuật, chất lượng công trình cho đến độ an toàn tuyệt đối trong quá trình thi công.
        </p>
        <p>
          Green Koi mang phong cách làm việc chuyên nghiệp , luôn sáng tạo, cẩn thận áp dụng vào
          quá trình thi công, nhờ vậy công trình được tạo ra luôn đảm bảo chất lượng tốt, thẩm mỹ cao thỏa mãn như

        </p>
        <div className="features-grid">
          <div className="feature-item">
            <i className="fas fa-star"></i>
            <h3>Chuyên gia hàng đầu</h3>
          </div>
          <div className="feature-item">
            <i className="fas fa-check-circle"></i>
            <h3>Chất lượng cao</h3>
          </div>
          <div className="feature-item">
            <i className="fas fa-palette"></i>
            <h3>Thiết kế độc đáo</h3>
          </div>
          <div className="feature-item">
            <i className="fas fa-shield-alt"></i>
            <h3>Bảo hành dài hạn</h3>
          </div>
        </div>
      </section>

      <section className="services-section">
        <h2>Dịch vụ của chúng tôi</h2>
        <div className="services-grid">
          <div className="service-item">
            <img src="https://bizweb.dktcdn.net/100/004/358/files/cau-tao-co-ban-cua-he-thong-loc-ho-ca-koi.jpg?v=1630837375907" alt="Thiết kế hồ cá" />
            <h3>Thiết kế hồ cá</h3>
          </div>
          <div className="service-item">
            <img src="https://hocakoi.vn/wp-content/uploads/2020/02/tieu-chuan-thi-cong-ho-ca-koi.jpg" alt="Thi công" />
            <h3>Thi công</h3>
          </div>
          <div className="service-item">
            <img src="https://ran.com.vn/wp-content/uploads/2021/05/img-2465_orig-1024x768.jpg" alt="Bảo trì" />
            <h3>Bảo trì</h3>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Bắt đầu dự án của bạn ngay hôm nay</h2>
        <p>Chúng tôi sẵn sàng biến ý tưởng của bạn thành hiện thực</p>
        <Link to="/contact" className="cta-button">Liên hệ ngay</Link>
      </section>

      <section className="testimonials-section">
        <h2>Khách hàng nói gì về chúng tôi!!</h2>
        <div className="testimonials-grid">
          <div className="testimonial-item">
            <p>"Green Koi đã tạo ra một tuyệt tác cho hồ cá của chúng tôi!"</p>
            <cite>- Ninh Đức Huy</cite>
          </div>
          <div className="testimonial-item">
            <p>"Chuyên nghiệp, tận tâm và sáng tạo. Tôi rất hài lòng!"</p>
            <cite>- Trần Anh Thông</cite>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Content;
