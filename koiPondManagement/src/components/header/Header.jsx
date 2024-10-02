import { headerLogo } from "../Share/listImage";
import { Link } from "react-router-dom";

function Header() {
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
            <Link to="/" className="nav-item nav-link active">
              Trang chủ
            </Link>
            <Link to="/gioithieu" className="nav-item nav-link">
              Giới thiệu
            </Link>
            <Link to="/duan" className="nav-item nav-link">
              Dự án
            </Link>
            <Link to="/dichvu" className="nav-item nav-link">
              Dịch vụ
            </Link>
            <Link to="/baogia" className="nav-item nav-link">
              Báo Giá
            </Link>
            <Link to="/lapthietketheoyeucau" className="nav-item nav-link">
              Lập thiết kế theo yêu cầu
            </Link>
            <Link to="/lienhe" className="nav-item nav-link">
              Liên hệ
            </Link>
          </div>
          <div className="navbar-login">
            <Link to="/login" className="nav-item nav-link btn-login">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
