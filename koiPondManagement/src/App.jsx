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
import Category from "./components/page/admin/category";
import BlogPage2 from "./components/elements/BlogPage2";
import GardenDesignFormPage from "./components/elements/GardenDesignFormPage";
import ProjectPage2 from "./components/elements/ProjectPage2";
import UserManagement from "./components/page/admin/manage-user";
import ManageUser from './components/page/admin/manage-user';
import ServicePage2 from "./components/elements/ServicePage2";
import Detail2 from "./components/elements/Detail2";
import ConstructionPage2 from "./components/elements/ConstructionPage2";
import MaintenancePage2 from "./components/elements/MaintenancePage2";
import Blog2 from "./components/elements/Blog2";
import Profile2 from "./components/elements/Profile2";

import PondDesign from "./components/page/admin/ponddesign/PondDesign";
import PondDesignColumns from "./components/page/admin/PondDesignColumns/PondDesignColumns";
import Consulting from "./components/page/admin/consulting/consulting";
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
          element: <Profile2 />,
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
          element: <Detail2 />,
        },
        {
          path: "/blog/:id",
          element: <Blog2 />,
        },
        {
          path: "/blog",
          element: <BlogPage2 />,
        },     
        {
          path: "/thiconghocakoi",
          element: <ServicePage2 />,
        },
        {
          path: "/baogiathicong",
          element: <ConstructionPage2 />,
        },
        {
          path: "/lapthietketheoyeucau",
          element: <GardenDesignFormPage />,
        },
    
        {
          path: "/baogiabaoduong",
          element: <MaintenancePage2 />,
        }      
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
        {
          path: "ponddesign",
          element: <PondDesign/>,
        },
        {
          path: "ponddesigncolumns",
          element: <PondDesignColumns/>,
        },
        {
          path: "consulting",
          element: <Consulting />,
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
