import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons"; // Thay đổi import này
import { headerLogo } from "../Share/listImage";
import "../header/Header.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/useSlice";

function Header() {
  const location = useLocation();
  const indicatorRef = useRef(null);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isActive = (path) => {
    if (path === "/baogia") {
      return location.pathname === "/baogia" ||
        location.pathname === "/baogiathicong" ||
        location.pathname === "/baogiabaoduong"
        ? "active"
        : "";
    }
    return location.pathname === path ? "active" : "";
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const activeItem = document.querySelector(".nav-item.active.main-link");
    if (activeItem && indicatorRef.current) {
      const itemWidth = activeItem.offsetWidth;
      indicatorRef.current.style.left = `${
        activeItem.offsetLeft + itemWidth / 2 - 10
      }px`;
    }
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token"); // Add this line
    navigate("/"); // Add this line to redirect to home page
  };

  const serviceItems = [
    {
      key: "1",
      label: (
        <Link to="/baogiathicong" onClick={(e) => e.stopPropagation()}>
          Báo giá thi công
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to="/baogiabaoduong" onClick={(e) => e.stopPropagation()}>
          Báo giá bảo dưỡng
        </Link>
      ),
    },
  ];

  const userMenuItems = [
    {
      key: "1",
      label: <Link to="/profile">Tài Khoản</Link>,
    },
    {
      key: "2",
      label: <Link to="/orders">Đơn hàng</Link>,
    },
    {
      key: "3",
      label: <Link to="/maintenanceProfile">Bảo trì</Link>,
    },
    {
      key: "4",
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          id="navbarCollapse"
        >
          <div className="navbar-nav ms-auto py-0">
            <div className="nav-indicator" ref={indicatorRef}></div>
            <Link
              style={{ color: "#FFDAB9" }}
              to="/"
              className={`nav-item nav-link main-link ${isActive("/")}`}
            >
              Trang chủ
            </Link>
            <Link
              style={{ color: "#FFDAB9" }}
              to="/gioithieu"
              className={`nav-item nav-link main-link ${isActive(
                "/gioithieu"
              )}`}
            >
              Giới thiệu
            </Link>
            <Link
              style={{ color: "#FFDAB9" }}
              to="/duan"
              className={`nav-item nav-link main-link ${isActive("/duan")}`}
            >
              Dự án
            </Link>
            <Link
              style={{ color: "#FFDAB9" }}
              to="/thiconghocakoi"
              className={`nav-item nav-link main-link ${isActive(
                "/thiconghocakoi"
              )}`}
            >
              Thi công hồ cá koi
            </Link>
            <Dropdown menu={{ items: serviceItems }}>
              <Link
                style={{ color: "#FFDAB9" }}
                to="/baogia"
                onClick={(e) => e.preventDefault()}
                className={`nav-item nav-link main-link ${isActive("/baogia")}`}
              >
                Báo Giá <DownOutlined className="dropdown-icon" />
              </Link>
            </Dropdown>
            <Link
              style={{ color: "#FFDAB9" }}
              to="/lapthietketheoyeucau"
              className={`nav-item nav-link main-link ${isActive(
                "/lapthietketheoyeucau"
              )}`}
            >
              Lập thiết kế theo yêu cầu
            </Link>
            <Link
              style={{ color: "#FFDAB9" }}
              to="/blog"
              className={`nav-item nav-link main-link ${isActive("/blog")}`}
            >
              Blog
            </Link>
          </div>
          <div className="navbar-login">
            {user === null ? (
              <Link
                to="/login"
                className={`nav-item nav-link btn-login ${isActive("/login")}`}
              >
                Đăng nhập
              </Link>
            ) : (
              <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                <a
                  onClick={(e) => e.preventDefault()}
                  className="ant-dropdown-link"
                  style={{ color: "#000" }}
                >
                  <UserOutlined /> {(user.username && user.username.split('_')[0]) || user.email}
                  <DownOutlined />
                </a>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
