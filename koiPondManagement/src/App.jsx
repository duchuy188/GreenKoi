import Elements from "./components/elements/HomePage";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./components/page/login";
import RegisterPage from "./components/page/register";

function App() {
  
  const router = createBrowserRouter([
    {
      path: "",
      element: <Elements />
    },
    {
      path: "/login",
      element: <LoginPage />
    },
    {
      path: "/register",
      element: <RegisterPage />
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}


export default App;