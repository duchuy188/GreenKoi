import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const navigate = useNavigate();

  const togglePhoneModal = () => {
    setShowPhoneModal(!showPhoneModal);
  };

  const handleRequestClick = (e) => {
    e.preventDefault();
    setShowPhoneModal(false); // Hide the modal
    navigate("/lapthietketheoyeucau"); // Navigate to the new page
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li>
              <Link to="/">Trang Chủ</Link>
            </li>
            <li>
              <Link to="/gioithieu">Giới Thiệu</Link>
            </li>
            <li>
              <Link to="/duan">Dự án</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/lapthietketheoyeucau">Lập Thiết Kế Theo Yêu Cầu</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Bản Đồ</h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6100105370224!2d106.8073080748579!3d10.84112758931161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1726802781524!5m2!1sen!2s"
            width="250"
            height="250"
            style={{ border: 0, display: "block", margin: "auto" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="footer-section">
          <h3>Liên Hệ</h3>
          <div className="card">
            <a
              className="socialContainer containerOne"
              href="https://www.instagram.com"
              target="_blank"
            >
              <svg viewBox="0 0 16 16" className="socialSvg instagramSvg">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"></path>
              </svg>
            </a>

            <a className="socialContainer containerTwo" href="#" onClick={togglePhoneModal}>
              <svg viewBox="0 0 24 24" className="socialSvg phoneSvg">
                <path
                  d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"
                  fill="#ffffff"
                />
                <path
                  d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z"
                  fill="#ffffff"
                />
              </svg>
            </a>
    
            <a
              className="socialContainer containerThree"
              href="https://mail.google.com"
              target="_blank"
            >
              <svg viewBox="0 0 24 24" className="socialSvg gmailSvg">
                <path
                  d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                  fill="#ffffff"
                />
              </svg>
            </a>

            <a
              className="socialContainer containerFour"
              href="https://www.pinterest.com"
              target="_blank"
            >
              <svg viewBox="0 0 24 24" className="socialSvg pinterestSvg">
                <path
                  d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"
                  fill="#ffffff"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Yêu cầu báo giá</h3>
          <ul>
            <li>
              <h6>Hotline: 1234 5678 98</h6>
            </li>
            <li>
              <button>
                <Link style={{color: 'black'}} to="/lapthietketheoyeucau">Gửi yêu cầu thiết kế</Link>
              </button>
            </li>
            <li>
              <h6>
                Chứng chỉ Năng lực Hoạt động Xây dựng Cấp III.
                Số: HCM-99999, cấp ngày 19/10/2024
                tại Sở Kế hoạch và Đầu tư thành phố Hồ Chí Minh.
              </h6>
            </li>
          </ul>
        </div>
      </div>

      {showPhoneModal && (
        <div className="modal-overlay" onClick={togglePhoneModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={togglePhoneModal}>&times;</span>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" className="modalPhoneSvg">
                <path
                  d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"
                  fill="#87CEEB"
                />
                <path
                  d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z"
                  fill="#87CEEB"
                />
              </svg>
            </div>
            <h2>1234 5678 98</h2>
            <p>Gọi ngay HOTLINE để được hỗ trợ tốt nhất</p>
            <p>Hoặc click nút bên dưới để gửi yêu cầu</p>
            <Link 
              to="/lapthietketheoyeucau" 
              className="modal-button"
              onClick={handleRequestClick}
            >
              Gửi Yêu Cầu Báo Giá
            </Link>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
