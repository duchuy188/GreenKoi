USE [KoiPondManagement];
GO
/*-- Xóa tất cả các ràng buộc khóa ngoại trước
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
    ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;
EXEC sp_executesql @sql;

-- 2. Xóa tất cả các bảng theo thứ tự phụ thuộc
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS project_cancellations;  
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS consultation_requests;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS designs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS project_statuses;
DROP TABLE IF EXISTS task_templates;
DROP TABLE IF EXISTS design_requests ;
PRINT 'All tables have been dropped successfully.';
*/

-- Bảng project_statuses
CREATE TABLE project_statuses (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);


-- Bảng roles
CREATE TABLE roles (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Bảng users
CREATE TABLE users (
    id NVARCHAR(36) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    phone NVARCHAR(20),
    full_name NVARCHAR(100),
    address NVARCHAR(MAX),
    role_id NVARCHAR(36),
    has_active_project BIT NOT NULL DEFAULT 0,  
    has_active_maintenance BIT NOT NULL DEFAULT 0,  
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Bảng designs 
CREATE TABLE designs (	
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    image_url NVARCHAR(255),
    base_price DECIMAL(10, 2) NOT NULL,
    shape NVARCHAR(50),
    dimensions NVARCHAR(50),
    features NVARCHAR(MAX),
    -- Thông tin quản lý
    created_by NVARCHAR(36),
    status NVARCHAR(20),
    rejection_reason NVARCHAR(MAX),
    is_active BIT NOT NULL DEFAULT 1,
    -- Phân loại và quản lý public
    is_public BIT NOT NULL DEFAULT 0,              -- Mẫu public/private
    is_custom BIT NOT NULL DEFAULT 0,              -- Thiết kế theo yêu cầu
    customer_approved_public BIT DEFAULT NULL,      -- Khách đồng ý public
    customer_approval_date DATETIME2 DEFAULT NULL,  -- Ngày khách đồng ý
    reference_design_id NVARCHAR(36) DEFAULT NULL, -- Mẫu tham khảo
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (reference_design_id) REFERENCES designs(id),
    CONSTRAINT CHK_design_status CHECK (
        status IN ('PENDING_APPROVAL','APPROVED','REJECTED','ARCHIVED')
    )
);

-- Bảng promotions
CREATE TABLE promotions (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Bảng projects 
CREATE TABLE projects (
    id NVARCHAR(36) PRIMARY KEY,
    customer_id NVARCHAR(36),
    consultant_id NVARCHAR(36),
    constructor_id NVARCHAR(36),  
    design_id NVARCHAR(36),
    promotion_id NVARCHAR(36),
    discounted_price DECIMAL(10, 2),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    status_id NVARCHAR(36),
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    remaining_amount NUMERIC(38, 2) NOT NULL DEFAULT 0, 
    start_date DATE,
    end_date DATE,
    address NVARCHAR(MAX),
    progress_percentage INT NOT NULL DEFAULT 0,
    completed_stages INT NOT NULL DEFAULT 0,  
    total_stages INT NOT NULL DEFAULT 7,     
    internal_notes NVARCHAR(MAX),
    payment_status NVARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    estimated_completion_date DATE,
    completion_date DATE,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (consultant_id) REFERENCES users(id),
    FOREIGN KEY (constructor_id) REFERENCES users(id), 
    FOREIGN KEY (design_id) REFERENCES designs(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    FOREIGN KEY (status_id) REFERENCES project_statuses(id),
    CONSTRAINT CHK_project_payment_status CHECK (payment_status IN ('UNPAID', 'DEPOSIT_PAID', 'FULLY_PAID'))
);

-- Bảng consultation_requests
CREATE TABLE consultation_requests (
    id NVARCHAR(36) PRIMARY KEY,
    customer_id NVARCHAR(36),
    consultant_id NVARCHAR(36),          -- Nhân viên tư vấn
    design_id NVARCHAR(36),              -- Mẫu thiết kế (nếu chọn mẫu có sẵn)
    is_custom_design BIT DEFAULT 0,       -- Đánh dấu thiết kế riêng
    -- Thông tin chung
    status NVARCHAR(20) NOT NULL,
    notes NVARCHAR(MAX),
    -- Thông tin thiết kế riêng
    requirements NVARCHAR(MAX),           -- Yêu cầu thiết kế
    preferred_style NVARCHAR(100),        -- Phong cách mong muốn
    dimensions NVARCHAR(50),              -- Kích thước dự kiến
    budget DECIMAL(10, 2),                -- Ngân sách dự kiến
    consultation_notes NVARCHAR(MAX),     -- Ghi chú của nhân viên tư vấn
    estimated_cost DECIMAL(10, 2),        -- Chi phí ước tính
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (consultant_id) REFERENCES users(id),
    FOREIGN KEY (design_id) REFERENCES designs(id),
   
    CONSTRAINT CHK_consultation_status CHECK (
        status IN ('PENDING',           -- Mới gửi yêu cầu
                  'IN_PROGRESS',        -- Đang tư vấn
                  'COMPLETED',          -- Đã tư vấn xong
                  'PROCEED_DESIGN',     -- Chuyển sang thiết kế (cho thiết kế riêng)
                  'CANCELLED')          -- Hủy yêu cầu
    )
);
-- Bảng design_requests
CREATE TABLE design_requests (
    id NVARCHAR(36) PRIMARY KEY,
    consultation_id NVARCHAR(36),         -- Liên kết với yêu cầu tư vấn
    designer_id NVARCHAR(36),             -- Designer được phân công
    design_id NVARCHAR(36),               -- Liên kết với design được tạo
    
    -- Thông tin thiết kế
    design_notes NVARCHAR(MAX),           -- Ghi chú của designer
    estimated_cost DECIMAL(10, 2),        -- Chi phí thiết kế
    rejection_reason NVARCHAR(MAX),       -- Lý do từ chối từ khách hàng
    
    -- Thông tin review nội bộ
    review_date DATETIME2,                -- Ngày tư vấn viên review
    reviewer_id NVARCHAR(36),             -- ID của tư vấn viên review
    review_notes NVARCHAR(MAX),           -- Ghi chú của tư vấn viên
    revision_count INT DEFAULT 0,         -- Số lần chỉnh sửa
    
    -- Tracking
    status nvarchar(30) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    -- Foreign keys
    FOREIGN KEY (consultation_id) REFERENCES consultation_requests(id),
    FOREIGN KEY (designer_id) REFERENCES users(id),
    FOREIGN KEY (design_id) REFERENCES designs(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    
    -- Status constraint
    CONSTRAINT CHK_design_request_status CHECK (
        status IN ('PENDING',                    -- Chờ thiết kế
                  'IN_PROGRESS',                 -- Đang thiết kế
                  'COMPLETED',                   -- Designer hoàn thành
                  'IN_REVIEW',                   -- Tư vấn viên đang review
                  'PENDING_CUSTOMER_APPROVAL',    -- Chờ khách duyệt
                  'APPROVED',                    -- Khách duyệt
                  'REJECTED',                    -- Khách từ chối
                  'CANCELLED')                   -- Hủy yêu cầu
    )
);

CREATE TABLE payments (
    id NVARCHAR(36) PRIMARY KEY,
    project_id NVARCHAR(36),
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATETIME2 NOT NULL,
    payment_method NVARCHAR(50) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    notes NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT CHK_payment_method CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'VNPAY')),
    CONSTRAINT CHK_payment_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);
-- Bảng maintenance_requests
CREATE TABLE maintenance_requests (
    id NVARCHAR(36) PRIMARY KEY,
    customer_id NVARCHAR(36),
    project_id NVARCHAR(36),
    consultant_id NVARCHAR(36),
    description NVARCHAR(MAX),
    attachments NVARCHAR(MAX),
    request_status NVARCHAR(20) NOT NULL,
    maintenance_status NVARCHAR(20),
    agreed_price DECIMAL(10, 2),
    scheduled_date DATE,
    start_date DATE,
    completion_date DATE,
    assigned_to NVARCHAR(36),
    cancellation_reason NVARCHAR(MAX),
    maintenance_notes NVARCHAR(MAX),  
    maintenance_images NVARCHAR(MAX),
    payment_status NVARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    payment_method NVARCHAR(20),
    deposit_amount DECIMAL(10, 2),
    remaining_amount DECIMAL(10, 2),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (consultant_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT CHK_maintenance_payment_status CHECK (payment_status IN ('UNPAID', 'DEPOSIT_PAID', 'FULLY_PAID')),
    CONSTRAINT CHK_maintenance_payment_method CHECK (payment_method IN ('CASH', 'VNPAY')),
    CONSTRAINT CHK_maintenance_request_status CHECK (request_status IN ('PENDING', 'REVIEWING', 'CONFIRMED', 'CANCELLED')),
    CONSTRAINT CHK_maintenance_status CHECK (maintenance_status IN ('ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'))
);




-- Bảng blog_posts 
CREATE TABLE blog_posts (
    id NVARCHAR(36) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX),
    author_id NVARCHAR(36),
    cover_image_url NVARCHAR(255),
    status NVARCHAR(20) NOT NULL,
    published_at DATETIME2,
    rejection_reason NVARCHAR(MAX),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (author_id) REFERENCES users(id),
);

-- Bảng reviews
CREATE TABLE reviews (
    id NVARCHAR(36) PRIMARY KEY,
    customer_id NVARCHAR(36),
    project_id NVARCHAR(36),
    maintenance_request_id NVARCHAR(36),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    review_date DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL,
    response NVARCHAR(MAX),
    response_date DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id)
);

-- Bảng tasks
CREATE TABLE tasks (
    id NVARCHAR(36) PRIMARY KEY,
    project_id NVARCHAR(36) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL,
    order_index INT NOT NULL,
    completion_percentage INT NOT NULL DEFAULT 0,
    notes NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);




-- Thêm dữ liệu vào bảng project_statuses
INSERT INTO project_statuses (id, name, description, is_active)
VALUES 
('PS1', 'PENDING', 'Project is waiting for approval', 1),
('PS2', 'APPROVED', 'Project has been approved and is ready to start', 1),
('PS3', 'PLANNING', 'Project is in the planning phase', 1),
('PS4', 'IN_PROGRESS', 'Project is currently in progress', 1),
('PS5', 'ON_HOLD', 'Project is temporarily on hold', 1),
('PS6', 'COMPLETED', 'Project has been completed', 1),
('PS7', 'CANCELLED', 'Project has been cancelled', 1),
('PS8', 'MAINTENANCE', 'Project is in the maintenance phase', 1),
('PS9', 'TECHNICALLY_COMPLETED', 'Project is technically completed but waiting for final payment', 1);


-- Thêm dữ liệu vào bảng roles
INSERT INTO roles (id, name, description, is_active, created_at, updated_at)
VALUES 
('1', 'Manager', N'Quản lý dự án, nhân viên, tài khoản người dùng và phân quyền', 1, GETDATE(), GETDATE()),
('2', 'Consulting Staff', N'Nhân viên tư vấn cho khách hàng', 1, GETDATE(), GETDATE()),
('3', 'Design Staff', N'Nhân viên thiết kế hồ cá Koi', 1, GETDATE(), GETDATE()),
('4', 'Construction Staff', N'Nhân viên thi công hồ cá Koi va bảo dưỡng và chăm sóc hồ cá', 1, GETDATE(), GETDATE()),
('5', 'Customer', N'Khách hàng sử dụng dịch vụ', 1, GETDATE(), GETDATE());

-- Thêm dữ liệu vào bảng users
INSERT INTO users (id, username, password, email, phone, full_name, role_id, is_active, created_at, updated_at)
VALUES 
('1', 'manager1', '$2a$12$gShHO6BeIKRLOnYGGHa4YOZSR1Z2jUJiekkuccwb1wvyUAJGzm9Dm', 'manager1@koipond.com', '0987654321', 'John Manager', '1', 1, GETDATE(), GETDATE()),
('2', 'consultant1', '$2a$12$rEcTavQ65J0/I0CkEff7TuMHg3rTYckaY9rtdLzoD9BUjBvbmJm9C', 'consultant1@koipond.com', '0987654322', 'Alice Consultant', '2', 1, GETDATE(), GETDATE()),
('3', 'designer1', '$2a$12$vZv5ELYDWsYF.Gf3dB3cwuvrbRSZdaml/CEB0kSgPJnbvS9exI8v2', 'designer1@koipond.com', '0987654323', 'Bob Designer', '3', 1, GETDATE(), GETDATE()),
('4', 'constructor1', '$2a$12$1RQNWGNLObv2eqdT/gOgUeFxHjdJqFjEIa/rVIGnVNgamWE35Qko2', 'constructor1@koipond.com','0987654324', 'Charlie Constructor', '4', 1, GETDATE(), GETDATE()),
('5', 'customer1', '$2a$12$Sr8YsayviFSTLZNbSrhq3uVcXQg5eyq1Ned8V/m1IpHNc7Lz6moiK', 'customer1@example.com', '0123456780', 'Eva Customer', '5', 1, GETDATE(), GETDATE()),
('6', 'customer2', '$2a$12$Sr8YsayviFSTLZNbSrhq3uVcXQg5eyq1Ned8V/m1IpHNc7Lz6moiK', 'customer2@example.com', '0123456781', 'Frank Customer', '5', 1, GETDATE(), GETDATE());



CREATE TABLE task_templates (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    order_index INT NOT NULL
);


INSERT INTO task_templates (id, name, description, order_index) VALUES
(NEWID(), N'Khảo sát và chuẩn bị mặt bằng', N'Khảo sát địa điểm và chuẩn bị mặt bằng cho việc xây dựng hồ cá Koi', 1),
(NEWID(), N'Đào đất và tạo hình dáng hồ', N'Đào đất theo thiết kế và tạo hình dáng cơ bản cho hồ cá Koi', 2),
(NEWID(), N'Xây dựng cấu trúc hồ và hệ thống lọc', N'Xây dựng các lớp cấu trúc của hồ và lắp đặt hệ thống lọc nước', 3),
(NEWID(), N'Lắp đặt hệ thống điện và ánh sáng', N'Lắp đặt hệ thống điện và ánh sáng cho hồ cá Koi', 4),
(NEWID(), N'Hoàn thiện cảnh quan xung quanh hồ', N'Tạo cảnh quan và trang trí xung quanh hồ cá Koi', 5),
(NEWID(), N'Kiểm tra chất lượng nước và hệ thống lọc', N'Kiểm tra và điều chỉnh chất lượng nước cùng hệ thống lọc', 6),
(NEWID(), N'Bàn giao và hướng dẫn sử dụng', N'Bàn giao dự án và hướng dẫn khách hàng cách sử dụng, bảo trì hồ cá Koi', 7);
PRINT 'Database setup completed successfully.';
