import React from 'react'

function Carousel() {
  const handleClick = (e, path) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    window.location.href = path;
  };

  return (
    <div className="container-fluid p-0">
      <div id="header-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img className="w-100" src="/img/images3.jpg" alt="Slide 1" />
            <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
              <div className="p-3" style={{maxWidth: 900}}>
                <h5 className="text-white text-uppercase mb-3 animated slideInDown">Thiết kế hồ cá Koi chuyên nghiệp</h5>
                <h1 className="display-2 text-white mb-md-4 animated zoomIn">Tạo không gian sống đẳng cấp với hồ cá Koi</h1>
                <a href="/clinic" onClick={(e) => handleClick(e, '/clinic')} className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Đặt lịch tư vấn</a>
                <a href="/contact" onClick={(e) => handleClick(e, '/contact')} className="btn btn-outline-light py-md-3 px-md-5 animated slideInRight">Liên hệ</a>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <img className="w-100" src="/img/tải xuống (2).jpg" alt="Slide 2" />
            <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
              <div className="p-3" style={{maxWidth: 900}}>
                <h5 className="text-white text-uppercase mb-3 animated slideInDown">Bảo dưỡng hồ cá Koi</h5>
                <h1 className="display-1 text-white mb-md-4 animated zoomIn">Dịch vụ chăm sóc hồ cá Koi hàng đầu</h1>
                <a href="/appointment" onClick={(e) => handleClick(e, '/appointment')} className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Đặt lịch bảo dưỡng</a>
                <a href="/contact" onClick={(e) => handleClick(e, '/contact')} className="btn btn-secondary py-md-3 px-md-5 animated slideInRight">Liên hệ</a>
              </div>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#header-carousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#header-carousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  )
}

export default Carousel