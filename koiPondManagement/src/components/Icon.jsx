import React, { useState, useEffect } from "react";
import "./Icon.css"; // Import CSS từ tệp riêng

const Icon = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // Xử lý khi cuộn trang để hiển thị hoặc ẩn nút quay lại đầu trang
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      // Kiểm tra xem người dùng đã cuộn đến cuối trang hay chưa
      if (scrollPosition >= pageHeight - 1) {
        // Trừ đi một đơn vị để phòng sai lệch số nhỏ
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener khi component bị unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Icon Zalo */}
      <a
        href="https://zalo.me/yourZaloID"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="zalo-icon"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1200px-Icon_of_Zalo.svg.png"
          alt="Zalo Icon"
        />
      </a>

      {/* Icon phone */}
      <a
        href=""
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="phone-icon"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsQ1P0KORmNh8JaQYf7QOnzwtgp_QIk5J2mA&s"
          alt="Phone Icon"
        />
      </a>

      {/* Icon email */}
      <a
        href=""
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="email-icon"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2Dk1skpw0d95QQAHQveUicEZ7RAA6cPmKBQ&s"
          alt="Email Icon"
        />
      </a>

      {/* Nút quay lại đầu trang */}
      {showBackToTop && (
        <div id="back-to-top" onClick={scrollToTop}>
          <img
            className="button"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBjMFnJ9N2mASVOusAh93qJlhzFn3Zx-TcVg&s"
          />
        </div>
      )}
    </div>
  );
};

export default Icon;