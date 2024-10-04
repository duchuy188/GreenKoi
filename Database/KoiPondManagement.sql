		USE [KoiPondManagement];
GO

-- Xóa tất cả các bảng hiện có (nếu cần)
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
		('1', 'manager1', 'password123', 'manager1@koipond.com', '0987654321', 'John Manager', '1', 1, GETDATE(), GETDATE()),
		('2', 'consultant1', 'password123', 'consultant1@koipond.com', '0987654322', 'Alice Consultant', '2', 1, GETDATE(), GETDATE()),
		('3', 'designer1', 'password123', 'designer1@koipond.com', '0987654323', 'Bob Designer', '3', 1, GETDATE(), GETDATE()),
		('4', 'constructor1', 'password123', 'constructor1@koipond.com', '0987654324', 'Charlie Constructor', '4', 1, GETDATE(), GETDATE()),
		('5', 'customer1', 'password123', 'customer1@example.com', '0123456780', 'Eva Customer', '5', 1, GETDATE(), GETDATE()),
		('6', 'customer2', 'password123', 'customer2@example.com', '0123456781', 'Frank Customer', '5', 1, GETDATE(), GETDATE());

UPDATE users
SET password = '$2a$12$gShHO6BeIKRLOnYGGHa4YOZSR1Z2jUJiekkuccwb1wvyUAJGzm9Dm'
WHERE username = 'manager1';

UPDATE users
SET password = '$2a$12$rEcTavQ65J0/I0CkEff7TuMHg3rTYckaY9rtdLzoD9BUjBvbmJm9C'
WHERE username = 'consultant1';

UPDATE users
SET password = '$2a$12$vZv5ELYDWsYF.Gf3dB3cwuvrbRSZdaml/CEB0kSgPJnbvS9exI8v2'
WHERE username = 'designer1';

UPDATE users
SET password = '$2a$12$1RQNWGNLObv2eqdT/gOgUeFxHjdJqFjEIa/rVIGnVNgamWE35Qko2'
WHERE username = 'constructor1';

UPDATE users
SET password = '$2a$12$Sr8YsayviFSTLZNbSrhq3uVcXQg5eyq1Ned8V/m1IpHNc7Lz6moiK'
WHERE username = 'maintenance1';

