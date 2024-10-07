import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons"; // Thay đổi import này
import { headerLogo } from "../Share/listImage";
import "../header/Header.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/useSlice";

function Header() {
  const location = useLocation();
  const indicatorRef = useRef(null);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  useEffect(() => {
    const activeItem = document.querySelector(".nav-item.active");
    if (activeItem && indicatorRef.current) {
      indicatorRef.current.style.width = `${activeItem.offsetWidth}px`;
      indicatorRef.current.style.left = `${activeItem.offsetLeft}px`;
    }
  }, [location]);


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
            <div className="nav-indicator" ref={indicatorRef}></div>
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
            <Link
              to="/thiconghocakoi"
              className={`nav-item nav-link ${isActive("/thiconghocakoi")}`}
            >
              Thi công hồ cá koi
            </Link>
            <Dropdown menu={{ items: serviceItems }}>
              <Link
                to="/baogia"
                onClick={(e) => e.preventDefault()}
                className={`nav-item nav-link ${isActive("/baogia")}`}
              >
                Báo Giá <DownOutlined className="dropdown-icon" />
              </Link>
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
            {user === null ? (
              <Link to="/login" className={`nav-item nav-link btn-login ${isActive('/login')}`}>
                Đăng nhập
              </Link>
            ) : (
              <div>
                <Link to="/profile" className={`nav-item nav-link ${isActive('/profile')}`}>
                <h5>{user.username}</h5>
            </Link>
                
                <button onClick={() => dispatch(logout())}>Đăng xuất</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
