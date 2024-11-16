import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "/src/components/config/axios";
import "./Profile.css";
import {
  Button,
  Form,
  Input,
  Modal,
  Table,
  Tabs,
  message,
  Popconfirm,
  DatePicker,
  Image,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import moment from "moment";
import ProfileInfo from "./ProfileInfo";
import ConsultationRequests from "./ConsultationRequests";
import MaintenanceRequests from "./MaintenanceRequests";
import DesignList from './DesignList';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      let profileInfo = {};

      // Use data from Redux store if available
      if (user) {
        profileInfo = {
          id: user.id,
          fullName: user.name || user.username || user.email, // Add 'name' field for Google login
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "User",
          projectCount: user.projectCount || 0,
        };
      }

      // Fetch additional profile data from API if needed
      if (!profileInfo.id) {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        profileInfo = { ...profileInfo, ...response.data };
      }

      // Ensure that id is saved to localStorage
      if (profileInfo.id) {
        localStorage.setItem("customerId", profileInfo.id);
      }

      setProfileData(profileInfo);
    } catch (err) {
      console.error("Error in fetchProfileData:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!profileData)
    return (
      <div>
        Không có dữ liệu hồ sơ nào khả dụng. Vui lòng thử làm mới trang.
      </div>
    );

  return (
    <div className="profile-background">
      <div className="container emp-profile">
        <div className="row">
          <div className="col-lg-4 pb-5">
            <div className="author-card pb-3">
              <div className="author-card-cover"></div>
              <div className="author-card-profile">
                <div className="author-card-avatar">
                  <img
                    src={
                      user?.picture ||
                      "https://bootdey.com/img/Content/avatar/avatar1.png"
                    }
                    alt={profileData?.fullName}
                  />
                </div>
                <div className="author-card-details">
                  <h5 className="author-card-name">
                    {profileData?.fullName ||
                      user?.name ||
                      user?.username ||
                      user?.email}
                  </h5>
                  <span className="author-card-position">
                    Ngày đăng nhập{" "}
                    {new Date(
                      profileData?.createdAt || user?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="wizard">
              <nav className="list-group list-group-flush">
                <a
                  className={`list-group-item ${
                    activeTab === "1" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("1")}
                >
                  <UserOutlined className="mr-1" />
                  <div className="d-inline-block font-weight-medium text-uppercase">
                    Cài đặt hồ sơ
                  </div>
                </a>
                <a
                  className={`list-group-item ${
                    activeTab === "2" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("2")}
                >
                  <ShoppingOutlined className="mr-1" />
                  <div className="d-inline-block font-weight-medium text-uppercase">
                    Yêu cầu của tôi
                  </div>
                </a>
              </nav>
            </div>
          </div>
          <div className="col-lg-8 pb-5">
            {activeTab === "1" && (
              <ProfileInfo
                profileData={profileData}
                setProfileData={setProfileData}
              />
            )}
            {activeTab === "2" && (
              <div>
                <h3>Yêu cầu của tôi</h3>
                <Tabs
                  defaultActiveKey="design"
                  items={[
                    {
                      key: "design",
                      label: "Yêu cầu thiết kế và xây dựng",
                      children: <ConsultationRequests />,
                    },
                    {
                      key: "maintenance",
                      label: "Yêu cầu bảo trì",
                      children: <MaintenanceRequests />,
                    },
                    {
                      key: "designs",
                      label: "Danh sách thiết kế",
                      children: <DesignList />,
                    }
                  ]}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
