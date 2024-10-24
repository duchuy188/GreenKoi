import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Sử dụng hook điều hướng
import { message } from "antd";
import api from "../../config/axios"; // Đảm bảo đường dẫn này chính xác
import "./GardenDesignForm.css"; // Tạo file CSS riêng cho component này

const GardenDesignForm = () => {
  const navigate = useNavigate(); // Hook điều hướng trang
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "", // for pond design
    description: "", // for pond design
    shape: "", // for pond design
    dimensions: "", // for pond design
    features: "", // for pond design
    customerName: "", // for consultation request
    customerPhone: "", // for consultation request
    customerAddress: "", // for consultation request
    notes: "", // for consultation request
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Giả sử token được lưu trong localStorage
        const response = await api.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = response.data;

        setFormData((prevData) => ({
          ...prevData,
          customerName: profileData.fullName || "",
          customerPhone: profileData.phone || "",
          customerAddress: profileData.address || "",
        }));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Xử lý lỗi ở đây, ví dụ hiển thị thông báo cho người dùng
      }
    };

    fetchUserProfile();

    // Điền thông tin từ location state nếu có
    if (location.state) {
      const { id, name, description, shape, dimensions, features, basePrice } =
        location.state;
      setFormData((prevData) => ({
        ...prevData,
        name,
        description,
        shape,
        dimensions,
        features,
        basePrice,
        designName: name,
        designDescription: description,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, upload: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Bạn cần đăng nhập để gửi yêu cầu");
      navigate("/login");
      return;
    }

    try {
      const consultationRequest = {
        designId: location.state?.projectId, // Use projectId from location state
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        designName: formData.designName,
        designDescription: formData.designDescription,
        notes: formData.notes || "",
      };

      console.log("Sending request:", consultationRequest);

      const response = await api.post(
        "/api/ConsultationRequests",
        consultationRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        alert("Yêu cầu tư vấn đã được gửi thành công!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      alert("Có lỗi xảy ra khi gửi yêu cầu tư vấn. Vui lòng thử lại sau.");
    }
  };

  // Hàm tạo ID duy nhất (có thể sử dụng thư viện như uuid nếu cần)
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  return (
    <div className="formrequestpond-container">
      <div className="formrequestpond-header">
        <h1>Đăng ký báo giá thiết kế hồ cá koi</h1>
        <p>
          Quý khách hàng vui lòng điền thông tin và nhu cầu thiết kế để được báo
          giá chi tiết
        </p>
        <p>
          <strong>Hotline/Zalo:</strong> 0933 606 119
        </p>
        <p>
          <strong>Email:</strong> info@sgl.com.vn
        </p>
      </div>
      <form onSubmit={handleSubmit} className="formrequestpond">
        <div className="formrequestpond-group">
          <label htmlFor="name">Tên thiết kế hồ cá:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled
          />
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="description">Mô tả thiết kế:</label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/duan/${location.state?.projectId}`)} // Điều hướng quay lại trang dự án
          >
            Xem chi tiết
          </button>
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="shape">Hình dạng hồ:</label>
          <input
            type="text"
            id="shape"
            name="shape"
            value={formData.shape}
            onChange={handleChange}
            required
            disabled
          />
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="dimensions">Kích thước:</label>
          <input
            type="text"
            id="dimensions"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            required
            disabled
          />
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="features">Tính năng đặc biệt:</label>
          <input
            type="text"
            id="features"
            name="features"
            value={formData.features}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="customerName">Tên khách hàng:</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="customerPhone">Số điện thoại:</label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="customerAddress">Địa chỉ:</label>
          <input
            type="text"
            id="customerAddress"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formrequestpond-group">
          <label htmlFor="notes">Ghi chú bổ sung:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="formrequestpond-submit">
          Gửi yêu cầu
        </button>
      </form>
    </div>
  );
};

export default GardenDesignForm;
