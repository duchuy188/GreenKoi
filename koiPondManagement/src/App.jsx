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

import ProjectPage2 from "./components/elements/ProjectPage2";
import Detail from "./components/Project/Detail";
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
      path: "/dashboard",
      element: <Dashboard />,
    },
    

  ]);

  return <RouterProvider router={router} />;
}

export default App;
