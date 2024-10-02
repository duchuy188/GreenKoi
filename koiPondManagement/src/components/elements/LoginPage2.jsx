import Header from "../header/Header";
import Content from "../Introduction/Content";
import Footer from "../footer/Footer";
import Icon from "../Icon";
import "../../App.css";
import LoginPage from "../page/login/index";

function LoginPage2() {
  return (
    <>
      <Header></Header>
      <LoginPage></LoginPage>
      <Footer></Footer>
      <Icon></Icon>
    </>
  );
}

export default LoginPage2;
