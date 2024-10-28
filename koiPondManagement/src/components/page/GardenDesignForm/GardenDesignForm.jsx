import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../config/axios";
import "./GardenDesignForm.css";

const GardenDesignForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shape: "",
    dimensions: "",
    features: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
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
      }
    };

    fetchUserProfile();

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
      toast.error("Bạn cần đăng nhập để gửi yêu cầu");
      navigate("/login");
      return;
    }

    try {
      const consultationRequest = {
        designId: location.state?.projectId,
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
        toast.success("Yêu cầu tư vấn đã được gửi thành công!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      toast.error(
        "Có lỗi xảy ra khi gửi yêu cầu tư vấn. Vui lòng hãy chọn dự án để gửi yêu cầu."
      );
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
          <strong>Hotline/Zalo:</strong> 0911 608 289
        </p>
        <p>
          <strong>Email:</strong> info@greenkoi.com.vn
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
            onClick={() => {
              if (!location.state?.projectId) {
                toast.error("Vui lòng hãy chọn dự án của bạn");
                navigate("/duan"); // Chuyển đến trang chọn dự án
              } else {
                navigate(`/duan/${location.state.projectId}`);
              }
            }}
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
            onInvalid={(e) =>
              e.target.setCustomValidity("Bạn vui lòng nhập tên")
            }
            onInput={(e) => e.target.setCustomValidity("")}
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
            onChange={(e) => {
              const value = e.target.value;

              // Kiểm tra chỉ số và không chứa chữ
              if (/^\d*$/.test(value)) {
                if (value.length <= 10) {
                  handleChange(e); // Cập nhật giá trị hợp lệ khi nhỏ hơn hoặc bằng 10 chữ số
                }
              }

              // Kiểm tra đúng 10 ký tự
              if (value.length !== 10) {
                e.target.setCustomValidity("Số điện thoại phải đúng 10 chữ số");
              } else {
                e.target.setCustomValidity("");
              }
            }}
            onInvalid={(e) =>
              e.target.setCustomValidity(
                "Bạn vui lòng nhập số điện thoại hợp lệ"
              )
            }
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
            onInvalid={(e) =>
              e.target.setCustomValidity("Bạn vui lòng nhập địa chỉ")
            }
            onInput={(e) => e.target.setCustomValidity("")}
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
