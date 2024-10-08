import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Sử dụng hook điều hướng

const GardenDesignForm = () => {
  const navigate = useNavigate(); // Hook điều hướng trang
  const [formData, setFormData] = useState({
    designName: '',
    gardenStyle: '',
    gardenArea: '',
    pondType: '',
    contactMethod: '',
    additionalRequests: '',
    upload: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, upload: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = localStorage.getItem('isLoggedIn'); // Giả sử bạn lưu trạng thái đăng nhập trong localStorage

    if (!isLoggedIn) {
      alert('Bạn cần đăng nhập để gửi yêu cầu'); // Hiển thị thông báo
      navigate('/login'); // Chuyển hướng tới trang đăng nhập nếu chưa đăng nhập
    } else {
      console.log('Received values:', formData);
      // Thực hiện gửi yêu cầu ở đây
      alert('Yêu cầu của bạn đã được gửi thành công!');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
      {/* Header Section */}
      <div style={{ backgroundColor: '#FFA500', padding: '10px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        <h1 style={{ color: '#fff', margin: '0' }}>Đăng ký báo giá thiết kế sân vườn</h1>
      </div>
      <div style={{ padding: '10px' }}>
        <p>Quý khách hàng vui lòng điền thông tin và nhu cầu thiết kế để được báo giá chi tiết</p>
        <p><strong>Hotline/Zalo:</strong> 0933 606 119</p>
        <p><strong>Email:</strong> info@sgl.com.vn</p>
      </div>
      
      {/* Form Section */}
      <form onSubmit={handleSubmit} style={{ padding: '10px' }}>
        <div>
          <label>Tên mẫu thiết kế:</label>
          <input type="text" name="designName" placeholder="Nhập tên mẫu thiết kế" onChange={handleChange} required />
        </div>

        <div>
          <label>Bạn muốn thiết kế sân vườn theo phong cách nào?</label>
          <div>
            <input type="radio" name="gardenStyle" value="japanese" onChange={handleChange} required />
            <label>Nhật Bản - Á Đông</label>
          </div>
          <div>
            <input type="radio" name="gardenStyle" value="modern" onChange={handleChange} required />
            <label>Hiện đại - Tropical</label>
          </div>
          <div>
            <input type="radio" name="gardenStyle" value="european" onChange={handleChange} required />
            <label>Châu Âu cổ điển</label>
          </div>
        </div>

        <div>
          <label>Diện tích sân vườn:</label>
          <div>
            <input type="radio" name="gardenArea" value="100-200" onChange={handleChange} required />
            <label>Từ 100m² đến dưới 200m²</label>
          </div>
          <div>
            <input type="radio" name="gardenArea" value="200-500" onChange={handleChange} required />
            <label>Từ 200m² đến dưới 500m²</label>
          </div>
          <div>
            <input type="radio" name="gardenArea" value="500-1000" onChange={handleChange} required />
            <label>Từ 500m² đến dưới 1.000m²</label>
          </div>
          <div>
            <input type="radio" name="gardenArea" value="1000-3000" onChange={handleChange} required />
            <label>Từ 1.000m² đến dưới 3.000m²</label>
          </div>
          <div>
            <input type="radio" name="gardenArea" value="3000-5000" onChange={handleChange} required />
            <label>Từ 3.000m² đến dưới 5.000m²</label>
          </div>
          <div>
            <input type="radio" name="gardenArea" value="5000+" onChange={handleChange} required />
            <label>Trên 5.000m²</label>
          </div>
        </div>

        <div>
          <label>Loại Hồ:</label>
          <div>
            <input type="radio" name="pondType" value="round" onChange={handleChange} required />
            <label>Hình Tròn</label>
          </div>
          <div>
            <input type="radio" name="pondType" value="ellipse" onChange={handleChange} required />
            <label>Hình Elip</label>
          </div>
          <div>
            <input type="radio" name="pondType" value="rectangle" onChange={handleChange} required />
            <label>Hình Chữ Nhật</label>
          </div>
          <div>
            <input type="radio" name="pondType" value="semi-circle" onChange={handleChange} required />
            <label>Hình Bán Nguyệt</label>
          </div>
          <div>
            <input type="radio" name="pondType" value="u-shape" onChange={handleChange} required />
            <label>Hình Chữ U</label>
          </div>
          <div>
            <input type="radio" name="pondType" value="free-shape" onChange={handleChange} required />
            <label>Hình Tự Do</label>
          </div>
        </div>

        <div>
          <label>Cách liên hệ:</label>
          <div>
            <input type="radio" name="contactMethod" value="zalo" onChange={handleChange} required />
            <label>Zalo</label>
          </div>
          <div>
            <input type="radio" name="contactMethod" value="phone" onChange={handleChange} required />
            <label>Gọi điện thoại</label>
          </div>
          <div>
            <input type="radio" name="contactMethod" value="sms" onChange={handleChange} required />
            <label>Tin nhắn</label>
          </div>
        </div>

        <div>
          <label>Tải hình yêu cầu của khách hàng:</label>
          <input type="file" onChange={handleFileChange} accept="image/jpeg,image/png" />
        </div>

        <div>
          <label>Yêu cầu khác (nếu có):</label>
          <textarea name="additionalRequests" placeholder="Nhập yêu cầu khác" onChange={handleChange} />
        </div>

        <div>
          <button type="submit">Gửi yêu cầu</button>
        </div>
      </form>
    </div>
  );
};

export default GardenDesignForm;
