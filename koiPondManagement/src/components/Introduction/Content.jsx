import { Component } from "react";
import "./Content.css";
export default class Content extends Component {
  render() {
    return (
      <div
        className="container-fluid py-5 mt-5 wow fadeInUp"
        data-wow-delay="0.1s"
      >
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7">
              <div className="section-title mb-4">
                <h5 className=" text-primary text-uppercase mb-2">
                  Về Green Koi
                </h5>
                <h1 className="display-5 mb-0">
                  Green Koi - Thiết kế hồ cá Koi đẳng cấp và chuyên nghiệp
                </h1>
              </div>
              <h4 className="text-body fst-italic mb-4">
                Tại Green Koi, chúng tôi cam kết mang đến những thiết kế hồ cá
                Koi tinh tế và bền vững, hài hòa với không gian sống.
              </h4>
              <p className="mb-4">
                Green Koi chuyên cung cấp dịch vụ tư vấn, thiết kế và thi công
                hồ cá Koi phong cách Nhật Bản. Chúng tôi sở hữu đội ngũ chuyên
                gia giàu kinh nghiệm và luôn cập nhật những xu hướng thiết kế
                mới nhất để mang lại sự hài lòng tối đa cho khách hàng. Các dự
                án của chúng tôi luôn chú trọng đến chất lượng, tính thẩm mỹ, và
                sự phù hợp với không gian sống.
              </p>
              <div className="row g-3">
                <div className="col-sm-6 wow zoomIn" data-wow-delay="0.3s">
                  <h5 className="mb-3">
                    <i className="fa fa-check-circle text-primary me-3"></i>
                    Chuyên gia hàng đầu
                  </h5>
                  <h5 className="mb-3">
                    <i className="fa fa-check-circle text-primary me-3"></i>
                    Chất lượng cao
                  </h5>
                </div>
                <div className="col-sm-6 wow zoomIn" data-wow-delay="0.6s">
                  <h5 className="mb-3">
                    <i className="fa fa-check-circle text-primary me-3"></i>
                    Thiết kế độc đáo
                  </h5>
                  <h5 className="mb-3">
                    <i className="fa fa-check-circle text-primary me-3"></i>
                    Bảo hành dài hạn
                  </h5>
                </div>
              </div>
              <a
                className="btn btn-primary py-3 px-5 mt-4 wow zoomIn"
                data-wow-delay="0.6s"
                href="/koi-pond"
              >
                Đặt Thiết Kế
              </a>
            </div>
            <div className="col-lg-5" style={{ minHeight: "400px" }}>
              <div className="position-relative h-100">
                <img
                  className="position-absolute w-100 h-100 rounded wow zoomIn"
                  data-wow-delay="0.9s"
                  src="https://amencornerponds.com/wp-content/uploads/2020/09/elaborate-ecosystem-pond-with-basins-bowl-and-waterfall.png"
                  style={{ objectFit: "cover" }}
                  alt="Koi Pond"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-5">
          <div className="row bg-light py-4 rounded">
            <div className="col-lg-8">
              <h2 className="mb-3">Liên hệ ngay với chúng tôi!</h2>
              <p>Chúng tôi luôn tự hào khi được đáp ứng sự hài lòng của bạn!</p>
            </div>
            <div className="col-lg-4 d-flex align-items-center justify-content-lg-end justify-content-center">
              <a href="/contact" className="btn btn-primary py-2 px-4">
                Nhận tư vấn
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
