import React from "react";
import Elements from "./components/elements/HomePage";
import Introduction from "./components/elements/IntroductionPage";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "./components/page/register";
import Dashboard from "./dashboard";
import MainLayout from "./layout";
import LoginPage from "./components/page/login";
// Change this line to match the correct path and filename of your Profile component

import UserManagement from "./components/page/admin/manage-user";
import ManageUser from "./components/page/admin/manage-user";

import Consulting from "./components/page/admin/consulting/request";
import RequestConsulting from "./components/page/admin/consulting/request";
import ConsultingOrders from "./components/page/admin/consulting/order";
import ServicePage from "./components/page/Service/ServicePage";
import OrdersList from "./components/page/admin/manage-orders";

import Profile from "./components/profile/Profile";
import MaintenancePage from "./components/page/maintenance/MaintenancePage";
import GardenDesignForm from "./components/page/GardenDesignForm/GardenDesignForm";
import ConstructionPage from "./components/page/constructionquote/ConstructionPage";
import Blog from "./components/page/Blog/Blog";
import BlogPage from "./components/page/Blog/BlogPage";

//VNPAY
import Successfully from "./components/ordersCustomer/Successfully";
import Error from "./components/ordersCustomer/Error";

// Pond Deisgn
import DesignProject from "./components/page/admin/ponddesign/designproject";
import PondDesign from "./components/page/admin/ponddesign/PondDesign";
import PondDesignColumns from "./components/page/admin/PondDesignColumns/PondDesignColumns";
import ProjectDetails from "./components/Project/Detail";
import ProjectPage from "./components/Project/ProjectPage";
import DesignBlog from "./components/page/admin/ponddesign/DesignBlog";
import BrowsePond from "./components/page/admin/PondDesignColumns/BrowsePond";
import BlogProject from "./components/page/admin/ponddesign/BlogProject";

import ProjectTasks from "./components/page/admin/construction/construction";
import ProtectedRoute from "./components/ProtectedRoute";
import InfoProfile from "./components/profiledashboard/InfoProfile";
import OrdersCustomer from "./components/ordersCustomer/OrdersCustomer";
import Maintenance from "./components/page/admin/manage-maintenance";
import MaintenanceRequest from "./components/page/admin/consulting/maintenance";
import ConstrucMain from "./components/page/admin/construction/construc-main";
import ConstrucReviewComplete from "./components/page/admin/construction/construc-reviewcomplete";
import Statistics from "./components/page/admin/manage-dashboard/statistics/Statistics";
import Cusmaintenance from "./components/page/maintenance/Cusmaintenance";
import ManageCustomerRequest from "./components/page/admin/manage-customer-request";
import RequestDesign from "./components/page/admin/RequestDesign/RequestDesign";
import CustomDesignForm from "./components/page/admin/RequestDesign/CustomDesignForm";


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
          path: "/orders",
          element: <OrdersCustomer />,
        },
        {
          path: "/maintenanceProfile",
          element: <Cusmaintenance />,
        },
        {
          path: "/duan",
          element: <ProjectPage />,
        },
        {
          path: "/duan/:id",
          element: <ProjectDetails />,
        },
        {
          path: "/blog/:id",
          element: <Blog />,
        },
        {
          path: "/blog",
          element: <BlogPage />,
        },
        {
          path: "/thiconghocakoi",
          element: <ServicePage />,
        },
        {
          path: "/baogiathicong",
          element: <ConstructionPage />,
        },
        {
          path: "/baogiabaoduong",
          element: <MaintenancePage />,
        },
        {
          path: "/lapthietketheoyeucau",
          element: <GardenDesignForm />,
        },
        {
          path: "/successfully",
          element: <Successfully />,
        },    
        {
          path: "/error",
          element: <Error />,
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
      element: <ProtectedRoute allowedRoles={[1, 2, 3, 4]} />,
      children: [
        {
          path: "",
          element: <Dashboard />,
          children: [
            {
              path: "usermanagement",
              element: <UserManagement />,
            },
            {
              path: "statistics",
              element: <Statistics />,
            },
            {
              path: "ponddesign",
              element: <PondDesign />,
            },
            {
              path: "designproject",
              element: <DesignProject />,
            },
            {
              path: "designblog",
              element: <DesignBlog />,
            },
            {
              path: "blogproject",
              element: <BlogProject />,
            },
            {
              path: "requestdesign",
              element: <RequestDesign/>,
            },
            {
              path: "requestdesign/:requestId",
              element: <CustomDesignForm />,
            },
            {
              path: "ponddesigncolumns",
              element: <PondDesignColumns />,
            },
            {
              path: "browsepond",
              element: <BrowsePond />,
            },

            //
            {
              path: "orderlist",
              element: <OrdersList />,
            },
            {
              path: "maintenance-manager",
              element: <Maintenance />,
            },
            {
              path: "nhanvientuvan",
              children: [
                {
                  path: "baotri",
                  element: <MaintenanceRequest />,
                },
                {
                  path: "yeucau",
                  element: <RequestConsulting />,
                },
                {
                  path: "donhang",
                  element: <ConsultingOrders />,
                },
              ],
            },
            {
              path: "nhanvientuvan/yeucau",
              element: <RequestConsulting />,
            },
            {
              path: "construction",
              children: [
                {
                  path: "tasks",
                  element: <ProjectTasks />,
                },
                {
                  path: "main",
                  element: <ConstrucMain />,
                },
                {
                  path: "reviewcomplete",
                  element: <ConstrucReviewComplete />,
                },
              ],
            },
            {
              path: "profile",
              element: <InfoProfile />,
            },
            {
              path: "customer-requests",
              element: <ManageCustomerRequest />,
            },
            // {
            //   path: "sevice",
            //   element: <Sevice />,
            // },
          ],
        },
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
