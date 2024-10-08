import React, { useRef } from "react";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./Carousel.css";

const CarouselItem = ({ title, subtitle, backgroundImage }) => (
  <div
    className="carousel-slide"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    <div className="carousel-content">
      <h2 className="carousel-title">{title}</h2>
      <p className="carousel-subtitle">{subtitle}</p>
    </div>
  </div>
);

const App = () => {
  const carouselRef = useRef(null);

  const next = () => {
    carouselRef.current.next();
  };

  const previous = () => {
    carouselRef.current.prev();
  };

  return (
    <div className="carousel-container">
      <Carousel
        ref={carouselRef}
        effect="fade"
        dots={{ className: "custom-dots" }}
      >
        <CarouselItem
          title="Thiết kế hồ cá Koi chuyên nghiệp"
          subtitle="Tạo không gian sống đẳng cấp với hồ cá Koi"
          backgroundImage="/img/images3.jpg"        
        />    
        <CarouselItem
          title="Bảo dưỡng hồ cá Koi"
          subtitle="Dịch vụ chăm sóc hồ cá Koi hàng đầu"
          backgroundImage="/img/cong-vien-ho-ca-koi-nhat-ban.jpg"
        />
        <CarouselItem
          title="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          subtitle="Third slide label"
          backgroundImage="/img/thiconghocakoi.jpg"
        />
      </Carousel>
      <button
        onClick={previous}
        className="carousel-button carousel-button-prev"
      >
        <LeftOutlined />
      </button>
      <button onClick={next} className="carousel-button carousel-button-next">
        <RightOutlined />
      </button>
    </div>
  );
};

export default App;


