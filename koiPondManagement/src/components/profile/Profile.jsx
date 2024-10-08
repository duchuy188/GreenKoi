import React, { useState, useEffect } from "react";
import api from '/src/components/config/axios';
import "./Profile.css";

// Tạo instance axios với interceptor
function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await api.get("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.data && typeof response.data === 'object') {
          setProfileData(response.data);
        } else {
          console.error("Unexpected API response structure:", response);
          setError("Unexpected API response structure. Please check the console for details.");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.response?.data?.message || err.message || "An error occurred while fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profileData) return <div>No profile data available. Please try refreshing the page.</div>;


  return (
    <div className="profile-background">
      <div className="container emp-profile">
        <form method="post">
          <div className="row">

            <div className="col-md-10">
              <div className="profile-head">
                <h5>{profileData.fullName}</h5>
                <h6>{profileData.role}</h6>
                <p className="proile-rating">
                  Số dự án đã đặt: <span>{profileData.projectCount || 0}</span>
                </p>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">
                      Thông tin
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">
                      Dự án
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-md-2">
              <input type="submit" className="profile-edit-btn" name="btnAddMore" value="Chỉnh sửa" />
            </div>
          </div>
          <div className="row">
            {/* <div className="col-md-12">
              <div className="profile-work">
                <p>THÔNG TIN LIÊN HỆ</p>
                <a href={`tel:${profileData.phone}`}>Số điện thoại: 0123456789</a>
                <br />
                <a href={`mailto:${profileData.email}`}>Email: greenkoi@gmail.com</a>
                <br />
                <a href="#">Địa chỉ: 22/12 Nguyễn Văn Cừ, Q.Bình Thạnh, TP.HCM</a>
                <p>Dịch Vụ</p>
                {profileData.services && profileData.services.map((service, index) => (
                  <React.Fragment key={index}>
                    <a href="#">{service}</a>
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div> */}
            <div className="col-md-12">
              <div className="tab-content profile-tab" id="myTabContent">
                <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      <div className="row">
                        <div className="col-md-6">
                          <label>Họ và tên</label>
                        </div>
                        <div className="col-md-6">
                          <p>{profileData.fullName}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <label>Email</label>
                        </div>
                        <div className="col-md-6">
                          <p>{profileData.email}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <label>Số điện thoại</label>
                        </div>
                        <div className="col-md-6">
                          <p>{profileData.phone}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <label>Địa chỉ</label>
                        </div>
                        <div className="col-md-6">
                          <p>{profileData.address}</p>
                        </div>
                        <hr className="my-4" />
                      </div>
                      
                      {/* Thêm thông tin liên hệ và dịch vụ ở đây */}
                      <div className="row mt-4">
                        <div className="col-md-6">
                          <div className="profile-work">
                            <p>THÔNG TIN LIÊN HỆ</p>
                            <a href={`tel:${profileData.phone}`}>Số điện thoại: {profileData.phone}</a>
                            <br />
                            <a href={`mailto:${profileData.email}`}>Email: {profileData.email}</a>
                            <br />
                            <a href="#">Địa chỉ: {profileData.address}</a>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="profile-work">
                            <p>Dịch Vụ</p>
                            <a href="">Thiết kế hồ cá Koi</a>
                            <br />
                            <a href="">Dịch vụ bảo trì</a>
                            <br />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                  {/* Project information can be added here dynamically if available in the API response */}
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