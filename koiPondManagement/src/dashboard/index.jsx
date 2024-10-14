import React, { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  CommentOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Button } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../components/redux/features/useSlice";

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
  getItem(<Link to="/dashboard/category">Category</Link>, "category", <PieChartOutlined />),
  getItem(<Link to="/dashboard/usermanagement">User Management</Link>, "usermanagement", <UserOutlined />),
  getItem(<Link to="/dashboard/ponddesigncolumns">Pond Design Columns</Link>, "ponddesigncolumns", <DesktopOutlined />),
  getItem(<Link to="/dashboard/ponddesign">Pond Design</Link>, "ponddesign", <FileOutlined/>),
  getItem(<Link to="/dashboard/consulting">Consulting Requests</Link>, "consulting", <CommentOutlined />),
];

const Dashboard = ({ adminName }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={["chart"]} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ padding: "20px" }}>
            <span
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1890ff",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              ADMIN DASHBOARD
            </span>
          </div>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ marginRight: 16, position: "absolute", right: 16 }}
          >
            Đăng xuất
          </Button>
        </Header>
        <Content
          style={{
            margin: "20px",
            padding: "20px",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Breadcrumb
            style={{
              marginBottom: "16px",
            }}
            items={breadcrumbItems}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: "#fff",
              borderRadius: borderRadiusLG,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
