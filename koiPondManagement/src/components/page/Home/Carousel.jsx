import React, { useRef, useEffect } from "react";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./Carousel.css";

const CarouselItem = ({ title, subtitle, backgroundImage }) => (
  <div className="carousel-slide">
    <div 
      className="carousel-background" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    ></div>
    <div className="carousel-content">
      <h2 className="carousel-title">{title}</h2>
      <p className="carousel-subtitle">{subtitle}</p>
      
    </div>
  </div>
);

const App = () => {
  const carouselRef = useRef(null);

  useEffect(() => {
    // Force a re-render of the carousel after component mount
    if (carouselRef.current) {
      carouselRef.current.goTo(0);
    }
  }, []);

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
        autoplay
        autoplaySpeed={5000}
        easing="ease-in-out"
        speed={1000}
        pauseOnHover={false}
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
          title="Tạo nên không gian sống hoàn hảo cho cá Koi"
          subtitle="Sáng tạo không gian sống lý tưởng cho cá Koi"
          backgroundImage="/img/thiconghocakoi.jpg"
        />
        <CarouselItem
          title="Thiết kế độc đáo, thi công chất lượng"
          subtitle="Tạo không gian thoải mái,chữa lành tâm hồn"
          backgroundImage="https://images.unsplash.com/photo-1466354424719-343280fe118b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
