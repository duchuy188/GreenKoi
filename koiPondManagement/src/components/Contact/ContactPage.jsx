import React from 'react'; 
import { Form, Input, Select, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './ContactPage.css';

const { Option } = Select;
const { TextArea } = Input;

function ContactPage() {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Received values:', values);
        // Xử lý gửi form ở đây
        // Thêm logic để gửi dữ liệu đến server hoặc xử lý locally
    };

    return (
        <div className="contact-page">
            <div className="contact-form">
                <h2>Đăng ký nhận báo giá ngay hôm nay!</h2>
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                        <Input placeholder="Họ tên" />
                    </Form.Item>
                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                        <Input placeholder="Số điện thoại" />
                    </Form.Item>
                    <Form.Item name="address">
                        <Input placeholder="Địa chỉ" />
                    </Form.Item>
                    <Form.Item name="area" rules={[{ required: true, message: 'Vui lòng nhập diện tích!' }]}>
                        <Input placeholder="Diện tích sân vườn (m2)" />
                    </Form.Item>
                    <Form.Item name="service" rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}>
                        <Select placeholder="Chọn dịch vụ">
                            <Option value="thicong">Thi công hồ cá Koi</Option>
                            <Option value="baoduong">Báo giá thi công</Option>
                            <Option value="thietke">Báo giá bảo dưỡng</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="message">
                        <TextArea rows={4} placeholder="Nội dung yêu cầu" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                            Gửi yêu cầu
                        </Button>
                    </Form.Item>
                </Form>
                <p className="form-note">*Thường phản hồi trong vòng 24h làm việc</p>
            </div>
            <div className="contact-info">
                <h2>Để bắt đầu một dự án mới!</h2>
                <p>Hãy gọi cho chúng tôi hoặc ghé qua bất cứ lúc nào, chúng tôi cố gắng trả lời mọi thắc mắc trong vòng 24 giờ vào các ngày làm việc. Rất hân hạnh được trả lời câu hỏi của bạn.</p>
                <h3>GREEN KOI VIETNAM</h3>
                <p>Mã số thuế: 0316287064</p>
                <p>Studio: 57 đường Vườn Đà Tây, An Khương, Tp. Thủ Đức, Tp. HCM</p>
                <p>Văn phòng: Số A-12B-1 Tầng 12A, Block A, Tòa nhà Centana Thủ Thiêm, 36 Mai Chí Thọ, P. An Phú, TP Thủ Đức, TP HCM</p>
                <p>Hotline: 0903 967 033</p>
                <p>Email: info@greenkoi.com.vn</p>
                <p>Website: greenkoi.com.vn</p>
                {/* Thêm các biểu tượng mạng xã hội ở đây */}
                
            </div>
        </div>
    );
}

export default ContactPage;
