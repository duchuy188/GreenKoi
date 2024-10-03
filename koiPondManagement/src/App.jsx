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
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
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
          path: "/login",
          element: <LoginPage2 />,
        },
        {
          path: "/register",
          element: <Register2 />,
        },
      ]
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
      path: '/dashboard',
      element: <Dashboard />,
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}


export default App;
