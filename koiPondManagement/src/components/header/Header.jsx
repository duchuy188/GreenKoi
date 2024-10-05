import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons"; // Thay đổi import này
import { headerLogo } from "../Share/listImage";
import "../header/Header.css";

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const priceItems = [
    {
      key: "1",
      label: (
        <Link to="/thietkevathicongsanvuon">Thiết Kế Và Thi Công Sân Vườn</Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to="/thietkevathiconghocakoi">
          Thiết Kế Và Thi Công Hồ Cá Koi
        </Link>
      ),
    },
  ];

  const serviceItems = [
    {
      key: "1",
      label: <Link to="/baogiathicong">Báo giá thi công</Link>,
    },
    {
      key: "2",
      label: <Link to="/baogiabaoduong">Báo giá bảo dưỡng</Link>,
    },
  ];

  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light shadow-sm px-5 py-3 py-lg-0">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <h1 className="m-0 text-primary">
            <img
              src={headerLogo}
              style={{ width: "70px", height: "70px" }}
              alt="Green Koi Logo"
            />
            <span className="logo-text ms-2">Green Koi</span>
          </h1>
        </Link>
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
            <Link to="/" className={`nav-item nav-link ${isActive("/")}`}>
              Trang chủ
            </Link>
            <Link
              to="/gioithieu"
              className={`nav-item nav-link ${isActive("/gioithieu")}`}
            >
              Giới thiệu
            </Link>
            <Link
              to="/duan"
              className={`nav-item nav-link ${isActive("/duan")}`}
            >
              Dự án
            </Link>
            <Dropdown menu={{ items: priceItems }}>
              <a
                onClick={(e) => e.preventDefault()}
                className={`nav-item nav-link ${isActive("/dichvu")}`}
              >
                Dịch Vụ <DownOutlined className="dropdown-icon" />
              </a>
            </Dropdown>
            <Dropdown menu={{ items: serviceItems }}>
              <a
                onClick={(e) => e.preventDefault()}
                className={`nav-item nav-link ${isActive("/baogia")}`}
              >
                Báo Giá <DownOutlined className="dropdown-icon" />
              </a>
            </Dropdown>
            <Link
              to="/lapthietketheoyeucau"
              className={`nav-item nav-link ${isActive(
                "/lapthietketheoyeucau"
              )}`}
            >
              Lập thiết kế theo yêu cầu
            </Link>
            <Link
              to="/lienhe"
              className={`nav-item nav-link ${isActive("/lienhe")}`}
            >
              Liên hệ
            </Link>
            <Link
              to="/blog"
              className={`nav-item nav-link ${isActive("/blog")}`}
            >
              Blog
            </Link>
          </div>
          <div className="navbar-login">
            <Link
              to="/login"
              className={`nav-item nav-link btn-login ${isActive("/login")}`}
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
