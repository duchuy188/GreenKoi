import React, { useState } from "react";
import {
  PieChartOutlined,
  UserOutlined,
  CommentOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, Button } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../components/redux/features/useSlice"; // Đảm bảo đường dẫn chính xác

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
  getItem(
    <Link to="/dashboard/category">Category</Link>,
    "category",
    <PieChartOutlined />
  ),
  getItem(
    <Link to="/dashboard/usermanagement">User Management</Link>,
    "usermanagement",
    <UserOutlined />
  ),
  getItem(
    <Link to="/dashboard/ponddesigncolumns">Pond Design Columns</Link>,
    "ponddesigncolumns",
    <UserOutlined />
  ),
  getItem(
    <Link to="/dashboard/ponddesign">Pond Design</Link>,
    "ponddesign",
    <UserOutlined />
  ),
  getItem("Consulting", "consulting", <CommentOutlined />, [
    getItem(
      <Link to="/dashboard/consulting/requests">Requests</Link>,
      "consulting-requests"
    ),
    getItem(
      <Link to="/dashboard/consulting/orders">Orders</Link>,
      "consulting-orders"
    ),
  ]),
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
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
            padding: 0,
            backgroundColor: "#fff", 
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", 
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginLeft: "20px",
              color: "#003366", 
            }}
          >
            Admin Dashboard
          </div>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              marginRight: 16,
              backgroundColor: "#003366",
              borderColor: "#003366",
            }}
          >
            Logout
          </Button>
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
            <Outlet />
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
    </Layout>
  );
};

export default Dashboard;
