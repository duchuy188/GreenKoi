import React from 'react';
import './Profile.css';
import { Link } from 'react-router-dom';

function Profile() {
  return (
    <div className="profile-background">
      <div className="container emp-profile">
        <form method="post">
          <div className="row">
            <div className="col-md-4">
              <div className="profile-img">
                <img src="https://example.com/customer-profile.jpg" alt="Profile" />
                <div className="file btn btn-lg btn-primary">
                  Change Photo
                  <input type="file" name="file" />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="profile-head">
                <h5>Nguyễn Văn A</h5>
                <h6>Khách hàng</h6>
                <p className="proile-rating">Số dự án đã đặt: <span>2</span></p>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Thông tin</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Dự án</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-md-2">
              <input type="submit" className="profile-edit-btn" name="btnAddMore" value="Chỉnh sửa"/>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="profile-work">
                  <p>THÔNG TIN TRANG WEB</p>
                <Link to="/" className="d-block mb-1">Trang chủ</Link>
                <Link to="/gioithieu" className="d-block mb-1">Giới thiệu</Link>
                <Link to="/duan" className="d-block mb-1">Dự án</Link>
                <Link to="/dichvu" className="d-block mb-1">Dịch vụ</Link>
                <Link to="/baogia" className="d-block mb-1">Báo Giá</Link>
                <Link to="/lapthietketheoyeucau" className="d-block mb-1">Lập thiết kế theo yêu cầu</Link>
                <Link to="/lienhe" className="d-block mb-1">Liên hệ</Link>
                <p>THÔNG TIN LIÊN HỆ</p>
                <a href="">Số điện thoại: 0123456789</a><br/>
                <a href="">Email: greenkoi@fpt,edu.vn</a><br/>
                <a href="">Địa chỉ: Khu công nghệ cao, Thủ Đức, TP.HCM</a>
                <p>Dịch Vụ</p>
                <a href="">Thiết kế hồ cá Koi</a><br/>
                <a href="">Dịch vụ bảo trì</a><br/>
              </div>
            </div>
            <div className="col-md-8">
              <div className="tab-content profile-tab" id="myTabContent">
                <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                  
                   
                  <div className="row">
                    <div className="col-md-6">
                      <label>Họ và tên</label>
                    </div>
                    <div className="col-md-6">
                      <p>Nguyễn Văn A</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Email</label>
                    </div>
                    <div className="col-md-6">
                      <p>nguyenvana@email.com</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Số điện thoại</label>
                    </div>
                    <div className="col-md-6">
                      <p>0123456789</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Địa chỉ</label>
                    </div>
                    <div className="col-md-6">
                      <p>2295/56, Đường 3/2, Khu phố 6, P. Bình Trị Đông A, Q. Bình Tân, TP.HCM</p>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                  <div className="row">
                    <div className="col-md-6">
                      <label>Số dự án đã hoàn thành</label>
                    </div>
                    <div className="col-md-6">
                      <p>1</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Dự án đang thực hiện</label>
                    </div>
                    <div className="col-md-6">
                      <p>1</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Tổng giá trị dự án</label>
                    </div>
                    <div className="col-md-6">
                      <p>500,000,000 VNĐ</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Loại hồ yêu thích</label>
                    </div>
                    <div className="col-md-6">
                      <p>Hồ cá Koi tự nhiên</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <label>Ghi chú</label><br/>
                      <p>Khách hàng thích thiết kế hồ cá Koi theo phong cách Nhật Bản, ưu tiên sử dụng vật liệu tự nhiên và hệ thống lọc sinh học.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;