import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../config/axios";
import "./GardenDesignForm.css";

const GardenDesignForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    consultantId: "",
    consultationNotes: "",
    designId: "",
    designName: "",
    designDescription: "",
    customDesign: true,
    requirements: "",
    pondType: "",
    dimensions: "",
    referenceImages: "",
    budget: "",
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
      const { projectId, name, description, dimensions, pondType } =
        location.state;
      setFormData((prevData) => ({
        ...prevData,
        designId: projectId,
        designName: name,
        designDescription: description,
        dimensions: dimensions,
        pondType: pondType,
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
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        consultantId: formData.consultantId,
        consultationNotes: formData.consultationNotes,
        designId: formData.designId,
        designName: formData.designName,
        designDescription: formData.designDescription,
        customDesign: formData.customDesign,
        requirements: formData.requirements,
        preferredStyle: formData.preferredStyle,
        dimensions: formData.dimensions,
        referenceImages: formData.referenceImages,
        budget: formData.budget,
        notes: formData.notes,
      };

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
      console.error("Error submitting request:", error);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="formrequestpond-container">
      <div className="formrequestpond-header">
        <h1>Đăng ký tư vấn thiết kế hồ cá Koi</h1>
        <p>Vui lòng điền đầy đủ thông tin để được tư vấn chi tiết</p>
      </div>
      <form onSubmit={handleSubmit} className="formrequestpond">
        <div className="formrequestpond-group">
          <label htmlFor="customerName">
            <span className="required">*</span> Tên khách hàng:
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            disabled={true}
            onInvalid={(e) =>
              e.target.setCustomValidity("Vui lòng nhập họ và tên")
            }
            onInput={(e) => e.target.setCustomValidity("")}
          />
        </div>

        <div className="formrequestpond-group">
          <label htmlFor="customerPhone">
            <span className="required">*</span> Số điện thoại:
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            title="Vui lòng nhập đúng 10 chữ số"
            maxLength="10"
            disabled={true}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>

        <div className="formrequestpond-group">
          <label htmlFor="customerAddress">
            <span className="required">*</span> Địa chỉ:
          </label>
          <input
            type="text"
            id="customerAddress"
            name="customerAddress"
            disabled={true}
            value={formData.customerAddress}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formrequestpond-group">
          <label htmlFor="preferredStyle">
            <span className="required">*</span> Loại hồ:
          </label>
          <input
            type="text"
            id="preferredStyle"
            name="preferredStyle"
            value={formData.preferredStyle}
            onChange={handleChange}
            title="Vui lòng nhập loại hồ"
            required
          />
        </div>

        <div className="formrequestpond-group">
          <label htmlFor="dimensions">
            <span className="required">*</span> Kích thước:
          </label>
          <input
            type="text"
            id="dimensions"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            title="Vui lòng nhập kích thước"
            required
          />
        </div>

        <div className="formrequestpond-group">
          <label htmlFor="requirements">
            <span className="required">*</span> Yêu cầu thiết kế:
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            title="Vui lòng nhập yêu cầu thiết kế"
            required
          />
        </div>

        <div className="formrequestpond-group">
          <label htmlFor="budget">
            <span className="required">*</span> Ngân sách dự kiến:
          </label>
          <input
            type="text"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            title="Vui lòng nhập ngân sách dự kiến"
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
          Gửi yêu cầu tư vấn
        </button>
      </form>
    </div>
  );
};

export default GardenDesignForm;
