
import { Component } from "react";
import { headerLogo } from "./Share/listImage";

function Header() {
  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light shadow-sm px-5 py-3 py-lg-0">
      <div className="container-fluid">
        <a href="/" className="navbar-brand">
          <h1 className="m-0 text-primary">
          <img
                    src={headerLogo}
                    style={{ width: "70px", height: "70px" }}
                    alt="Green Koi Logo"
                  />
            <span className="logo-text ms-2">Green Koi</span>
          </h1>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto py-0">
            <a href="/" className="nav-item nav-link active">
              Trang chủ
            </a>
            <a href="/clinic" className="nav-item nav-link">
              Giới thiệu
            </a>
            <a href="/services" className="nav-item nav-link">
              Dự án
            </a>
            <a href="/team" className="nav-item nav-link">
              Báo Giá
            </a>
            <a href="/contact" className="nav-item nav-link">
              Lập thiết kế theo yêu cầu
            </a>
            <a href="/contact" className="nav-item nav-link">
              Liên hệ
            </a>
            
          </div>
          <div className="navbar-login">
            <a href="/login" className="nav-item nav-link btn-login">Đăng nhập</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
