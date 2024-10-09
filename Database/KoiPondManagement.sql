USE [KoiPondManagement];
GO

-- Xóa tất cả các bảng hiện có (nếu cần)
/*
DROP TABLE IF EXISTS project_cancellations;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS blog_post_categories;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS project_stages;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS consultation_requests;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS designs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS cancellation_policies;
DROP TABLE IF EXISTS project_statuses;
DROP TABLE IF EXISTS project_stage_statuses;
*/
-- Bảng project_statuses (mới)
CREATE TABLE project_statuses (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Bảng project_stage_statuses (mới)
CREATE TABLE project_stage_statuses (
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
    created_by NVARCHAR(36),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(id)
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
    design_id NVARCHAR(36),
    promotion_id NVARCHAR(36),
    discounted_price DECIMAL(10, 2),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    status_id NVARCHAR(36),
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    address NVARCHAR(MAX),
    progress_percentage INT NOT NULL DEFAULT 0,
    internal_notes NVARCHAR(MAX),
    customer_feedback NVARCHAR(MAX),
    payment_status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    estimated_completion_date DATE,
    total_stages INT NOT NULL DEFAULT 0,
    completed_stages INT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (consultant_id) REFERENCES users(id),
    FOREIGN KEY (design_id) REFERENCES designs(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    FOREIGN KEY (status_id) REFERENCES project_statuses(id)
);


-- Bảng consultation_requests
CREATE TABLE consultation_requests (
    id NVARCHAR(36) PRIMARY KEY,
    customer_id NVARCHAR(36),
    design_id NVARCHAR(36),
    status NVARCHAR(20) NOT NULL,
    notes NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (design_id) REFERENCES designs(id)
);

-- Bảng project_stages (đã sửa đổi)
CREATE TABLE project_stages (
    id NVARCHAR(36) PRIMARY KEY,
    project_id NVARCHAR(36),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    status_id NVARCHAR(36),
    start_date DATE,
    end_date DATE,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (status_id) REFERENCES project_stage_statuses(id)
);

-- Bảng payments
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
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Bảng maintenance_requests
CREATE TABLE maintenance_requests (
    id NVARCHAR(36) PRIMARY KEY,
    customer_id NVARCHAR(36),
    project_id NVARCHAR(36),
    description NVARCHAR(MAX),
    cost DECIMAL(10, 2),
    scheduled_date DATE,
    completion_date DATE,
    status NVARCHAR(20) NOT NULL,
    assigned_to NVARCHAR(36),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);


-- Bảng blog_categories
CREATE TABLE blog_categories (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Bảng blog_posts
CREATE TABLE blog_posts (
    id NVARCHAR(36) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX),
    author_id NVARCHAR(36),
    category_id NVARCHAR(36),
    image_url NVARCHAR(255),
    status NVARCHAR(20) NOT NULL,
    published_at DATETIME2,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES blog_categories(id)
);

-- Bảng blog_post_categories
CREATE TABLE blog_post_categories (
    id NVARCHAR(36) PRIMARY KEY,
    blog_post_id NVARCHAR(36),
    category_id NVARCHAR(36),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id),
    FOREIGN KEY (category_id) REFERENCES blog_categories(id)
);

-- Bảng reviews
CREATE TABLE reviews (
    id NVARCHAR(36) PRIMARY KEY,
    customer_id NVARCHAR(36),
    project_id NVARCHAR(36),
    maintenance_request_id NVARCHAR(36),
    rating INT NOT NULL,
    comment NVARCHAR(MAX),
    review_date DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id)
);

-- Bảng cancellation_policies
CREATE TABLE cancellation_policies (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    refund_percentage DECIMAL(5, 2) NOT NULL,
    time_limit INT NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);


-- Bảng project_cancellations
CREATE TABLE project_cancellations (
    id NVARCHAR(36) PRIMARY KEY,
    project_id NVARCHAR(36),
    policy_id NVARCHAR(36),
    reason NVARCHAR(MAX),
    requested_by NVARCHAR(36),
    status NVARCHAR(20) NOT NULL,
    refund_amount DECIMAL(10, 2),
    cancellation_date DATETIME2 NOT NULL,
    processed_by NVARCHAR(36),
    processed_at DATETIME2,
    notes NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (policy_id) REFERENCES cancellation_policies(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
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
('PS8', 'MAINTENANCE', 'Project is in the maintenance phase', 1);

-- Thêm dữ liệu vào bảng project_stage_statuses
INSERT INTO project_stage_statuses (id, name, description, is_active)
VALUES 
('PSS1', 'PENDING', 'Stage is waiting to start', 1),
('PSS2', 'IN_PROGRESS', 'Stage is currently in progress', 1),
('PSS3', 'COMPLETED', 'Stage has been completed', 1),
('PSS4', 'ON_HOLD', 'Stage is temporarily on hold', 1);

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
('4', 'constructor1', '$2a$12$1RQNWGNLObv2eqdT/gOgUeFxHjdJqFjEIa/rVIGnVNgamWE35Qko2', 'constructor1@koipond.com', '0987654324', 'Charlie Constructor', '4', 1, GETDATE(), GETDATE()),
('5', 'customer1', '$2a$12$Sr8YsayviFSTLZNbSrhq3uVcXQg5eyq1Ned8V/m1IpHNc7Lz6moiK', 'customer1@example.com', '0123456780', 'Eva Customer', '5', 1, GETDATE(), GETDATE()),
('6', 'customer2', '$2a$12$Sr8YsayviFSTLZNbSrhq3uVcXQg5eyq1Ned8V/m1IpHNc7Lz6moiK', 'customer2@example.com', '0123456781', 'Frank Customer', '5', 1, GETDATE(), GETDATE());




-- Thêm dữ liệu vào bảng designs
INSERT INTO designs (id, name, description, base_price, created_by)
VALUES 
('D1', 'Classic Koi Pond', 'A traditional Japanese-style koi pond', 5000.00, '3'),
('D2', 'Modern Minimalist Pond', 'A sleek, contemporary koi pond design', 6000.00, '3');

-- Thêm dữ liệu vào bảng promotions
INSERT INTO promotions (id, name, description, discount_value, start_date, end_date)
VALUES 
('P1', 'Summer Sale', '10% off on all pond designs', 10.00, '2024-06-01', '2024-08-31');

-- Thêm dữ liệu vào bảng projects 
INSERT INTO projects (id, customer_id, consultant_id, design_id, promotion_id, name, description, status_id, total_price, deposit_amount, start_date, end_date, address, progress_percentage, payment_status, estimated_completion_date, total_stages, completed_stages)
VALUES 
('PR1', '5', '2', 'D1', 'P1', 'Eva''s Backyard Oasis', 'A beautiful koi pond for Eva''s backyard', 'PS4', 4500.00, 1000.00, '2024-07-01', '2024-08-15', '123 Main St, Cityville', 30, 'PARTIAL', '2024-08-15', 3, 1),
('PR2', '6', '2', 'D2', NULL, 'Frank''s Modern Pond', 'A minimalist koi pond for Frank''s garden', 'PS3', 6000.00, 1500.00, '2024-08-01', '2024-09-30', '456 Elm St, Townsville', 10, 'PARTIAL', '2024-09-30', 3, 1);

-- Thêm dữ liệu vào bảng project_stages
INSERT INTO project_stages (id, project_id, name, description, status_id, start_date, end_date)
VALUES 
('PS1', 'PR1', 'Design Approval', 'Get customer approval on final design', 'PSS3', '2024-07-01', '2024-07-07'),
('PS2', 'PR1', 'Excavation', 'Dig the pond area', 'PSS2', '2024-07-08', '2024-07-15'),
('PS3', 'PR2', 'Initial Consultation', 'Meet with customer to discuss requirements', 'PSS3', '2024-08-01', '2024-08-03');

-- Thêm dữ liệu vào bảng payments
INSERT INTO payments (id, project_id, amount, payment_date, payment_method, status)
VALUES 
('PAY1', 'PR1', 1000.00, '2024-07-01', 'Credit Card', 'COMPLETED'),
('PAY2', 'PR2', 1500.00, '2024-08-01', 'Bank Transfer', 'COMPLETED');


-- Them du lieu vao bang designs
INSERT INTO designs (id, name, description, image_url, base_price, shape, dimensions, features, created_by, is_active)
VALUES 
('D3', N'Hồ Cá Koi Hiện Đại', N'Thiết kế hồ cá Koi phong cách hiện đại', 'https://example.com/modern-koi-pond.jpg', 7500.00, N'Hình chữ nhật', '5m x 3m x 1.5m', N'Hệ thống lọc tự động, đèn LED, thác nước mini', '3', 1),
('D4', N'Hồ Cá Koi Tự Nhiên', N'Thiết kế hồ cá Koi kiểu tự nhiên', 'https://example.com/natural-koi-pond.jpg', 6500.00, N'Hình tự do', '4m x 3m x 1.2m', N'Thác đá tự nhiên, cây thủy sinh', '3', 1),
('D5', N'Hồ Cá Koi Mini', N'Thiết kế hồ cá Koi nhỏ gọn', 'https://example.com/mini-koi-pond.jpg', 4500.00, N'Hình tròn', '2m đường kính x 1m sâu', N'Hệ thống lọc compact, đèn LED', '3', 1);