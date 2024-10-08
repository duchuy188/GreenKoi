import React from "react";
import Elements from "./components/elements/HomePage";
import Introduction from "./components/elements/IntroductionPage";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage2 from "./components/elements/LoginPage2";
import RegisterPage from "./components/page/register";
import Dashboard from "./dashboard";
import MainLayout from "./layout";
import LoginPage from "./components/page/login";
import Register2 from "./components/elements/Register2";
// Change this line to match the correct path and filename of your Profile component
import Profile from "./components/profile/Profile";
import Category from "./components/page/admin/category";
import BlogPage2 from "./components/elements/BlogPage2";
import Blog from "./components/page/Blog/Blog";

import ContactPage from "./components/page/Contact/ContactPage";
import ProjectPage2 from "./components/elements/ProjectPage2";
import Detail from "./components/Project/Detail";
import UserManagement from "./components/page/admin/manage-user";
import ManageUser from './components/page/admin/manage-user';
import ServicePage from "./components/page/Service/ServicePage";
import ConstructionPage from "./components/page/constructionquote/ConstructionPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/",
          element: <Elements />,
        },
        {
          path: "/gioithieu",
          element: <Introduction />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/login",
          element: <LoginPage2 />,
        },
        {
          path: "/register",
          element: <Register2 />,
        },
        {
          path: "/duan",
          element: <ProjectPage2 />,
        },
        {
          path: "/duan/:id",
          element: <Detail />,
        },
        {
          path: "/blog/:id",
          element: <Blog />,
        },
        {
          path: "/blog",
          element: <BlogPage2 />,
        },
        {
          path: "/lienhe",
          element: <ContactPage />,
        },
        {
          path: "/thiconghocakoi",
          element: <ServicePage />,
        },
        {
          path: "/baogiathicong",
          element: <ConstructionPage />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "dashboard",
      element: <Dashboard />,
      children: [
        {
          path: "category",
          element: <Category />,
        },
        {
          path: "usermanagement",
          element: <UserManagement/>,
        },
        // {
        //   path: "sevice",
        //   element: <Sevice />,
        // },
      ],
    },
    {
      path: "/admin/manage-users",
      element: <ManageUser />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
