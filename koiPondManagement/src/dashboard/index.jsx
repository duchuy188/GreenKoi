import React, { useState, useEffect } from "react";
import {
  PieChartOutlined,
  UserOutlined,
  CommentOutlined,
  LogoutOutlined,
  DownOutlined
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, Button, Dropdown, Modal, Avatar, Space } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../components/redux/features/useSlice";
import AccessDenied from "../components/AccessDenied";
import InfoProfile from "../components/profiledashboard/InfoProfile";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  // getItem(
  //   <Link to="/dashboard/category">Category</Link>,
  //   "category",
  //   <PieChartOutlined />
  // ),
  getItem("Quản lý", "management", <UserOutlined />, [
    getItem(
      <Link to="/dashboard/usermanagement">Quản lý tài khoản</Link>,
      "usermanagement"
    ),
    getItem(
      <Link to="/dashboard/ponddesigncolumns">Quản lý thiết kế</Link>,
      "ponddesigncolumns"
    ),
    getItem(
      <Link to="/dashboard/orderlist">Quản lý đơn hàng</Link>,
      "orderlist"
    ),
    getItem(
      <Link to="/dashboard/browsepond">Quản lý Blog</Link>,
      "browsepond"
    ),
  ]),
  getItem("Nhân Viên Thiết Kế", "ponddesigns", <UserOutlined />, [
  getItem(
    <Link to="/dashboard/ponddesign">Tạo Thiết Kế Hồ</Link>,
    "ponddesign",
  ),
  getItem(
    <Link to="/dashboard/designproject">Bảng Thiết Kế</Link>,
    "designproject",
  ),
  getItem(
    <Link to="/dashboard/designblog">Tạo Blog</Link>,
    "designblog",
  ),
  getItem(
    <Link to="/dashboard/blogproject">Bảng Blog</Link>,
    "blogproject",
  ),
  ]),
  getItem("NHân viên tư vấn", "consulting", <CommentOutlined />, [
    getItem(
      <Link to="/dashboard/consulting/requests">Yêu cầu</Link>,
      "consulting-requests"
    ),
    getItem(
      <Link to="/dashboard/consulting/orders">Đơn hàng</Link>,
      "consulting-orders"
    ),
  ]),
  getItem("NHân viên xây dựng", "construction", <CommentOutlined />, [
    getItem(
      <Link to="/dashboard/construction/tasks">Công việc</Link>,
      "construction-tasks"
    ),
  ]),
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [username, setUsername] = useState("");

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      key: url,
      title: <Link to={url}>{pathSnippets[index]}</Link>,
    };
  });

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.roleId === 5) {
      navigate('/');
    }
  }, [navigate]);

  const isAllowed = (path) => {
    const roleId = Number(user.roleId);
    // Allow access to /dashboard/category for all roles
    if (path.includes('category')) {
      return true;
    }

    if (path.includes('usermanagement') || path.includes('ponddesigncolumns') || path.includes('orderlist') || path.includes('browsepond')) {
      console.log('Checking manager access:', roleId === 1);
      return roleId === 1; // Manager
    }
    if (path.includes('ponddesign') || path.includes('designproject') || path.includes('designblog') || path.includes('blogproject')) {
      return roleId === 3; // Designer
    }
    if (path.includes('consulting')) {
      return roleId === 2; // Consultant
    }
    if (path.includes('construction')) {
      return roleId === 4; // Constructor
    }
   
    return false;
  };

  useEffect(() => {
    console.log('Is allowed:', isAllowed(location.pathname));
  }, [location.pathname, user.roleId]);

  const handleViewProfile = () => {
    setIsProfileModalVisible(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalVisible(false);
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />} onClick={handleViewProfile}>
        View my profile
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUsername(storedUser.username || storedUser.fullName || "User");
    }
  }, []);

  const getAvatarContent = () => {
    if (user.avatar) {
      return <Avatar src={user.avatar} />;
    }
    return <Avatar style={{ backgroundColor: '#f56a00' }}>{username.charAt(0).toUpperCase()}</Avatar>;
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          backgroundColor: "#003366", 
        }}
      >
        <div
          className="demo-logo-vertical"
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            color: "#fff", 
            textAlign: "center",
            fontSize: "18px",
          }}
        >
          GreenKoi
        </div>
        <Menu
          mode="inline"
          items={items}
          theme="dark"
          style={{
            backgroundColor: "#003366", 
            color: "#fff", 
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            backgroundColor: "#fff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Dropdown overlay={profileMenu} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                {getAvatarContent()}
                <DownOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "16px",
            padding: "24px",
            backgroundColor: "#fff", 
            borderRadius: 8, 
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", 
          }}
        >
          <Breadcrumb
            style={{
              marginBottom: "16px",
              color: "#003366", 
            }}
            items={breadcrumbItems}
          />
          <div
            style={{
              minHeight: 360,
              padding: "24px",
              backgroundColor: "#f0f2f5", 
              borderRadius: 8, 
            }}
          >
            {isAllowed(location.pathname) ? <Outlet /> : <AccessDenied />}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
            backgroundColor: "#003366", 
            color: "#fff", 
            padding: "12px 0",
          }}
        >
          GreenKoi ©{new Date().getFullYear()} Created by Your Company
        </Footer>
      </Layout>
      <Modal
        title="User Profile"
        visible={isProfileModalVisible}
        onCancel={handleCloseProfileModal}
        footer={null}
        width={800}
      >
        <InfoProfile />
      </Modal>
    </Layout>
  );
};

export default Dashboard;
