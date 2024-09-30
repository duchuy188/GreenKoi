		USE [KoiPondManagement];
		GO

		/*
		-- Xóa tất cả các bảng hiện có
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
		*/

		-- Bảng roles
		CREATE TABLE roles (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(50) NOT NULL,
			description TEXT,
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
		);

		-- Bảng users
		CREATE TABLE users (
			id VARCHAR(36) PRIMARY KEY,
			username VARCHAR(50) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			email VARCHAR(100) NOT NULL UNIQUE,
			phone VARCHAR(20),
			full_name VARCHAR(100),
			role_id VARCHAR(36),
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (role_id) REFERENCES roles(id)
		);

		-- Bảng designs
		CREATE TABLE designs (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			image_url VARCHAR(255),
			base_price DECIMAL(10, 2) NOT NULL,
			shape VARCHAR(50),
			dimensions VARCHAR(50),
			features TEXT,
			created_by VARCHAR(36),
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (created_by) REFERENCES users(id)
		);

		-- Bảng promotions
		CREATE TABLE promotions (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			discount_value DECIMAL(10, 2) NOT NULL,
			start_date DATE NOT NULL,
			end_date DATE NOT NULL,
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
		);

		-- Bảng projects
		CREATE TABLE projects (
			id VARCHAR(36) PRIMARY KEY,
			customer_id VARCHAR(36),
			consultant_id VARCHAR(36),
			design_id VARCHAR(36),
			promotion_id VARCHAR(36),
			discounted_price DECIMAL(10, 2),
			name VARCHAR(100) NOT NULL,
			description TEXT,
			status VARCHAR(20) NOT NULL,
			total_price DECIMAL(10, 2) NOT NULL,
			deposit_amount DECIMAL(10, 2) NOT NULL,
			start_date DATE,
			end_date DATE,
			address TEXT,
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (customer_id) REFERENCES users(id),
			FOREIGN KEY (consultant_id) REFERENCES users(id),
			FOREIGN KEY (design_id) REFERENCES designs(id),
			FOREIGN KEY (promotion_id) REFERENCES promotions(id)
		);

		-- Bảng consultation_requests
		CREATE TABLE consultation_requests (
			id VARCHAR(36) PRIMARY KEY,
			customer_id VARCHAR(36),
			design_id VARCHAR(36),
			status VARCHAR(20) NOT NULL,
			notes TEXT,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (customer_id) REFERENCES users(id),
			FOREIGN KEY (design_id) REFERENCES designs(id)
		);

		-- Bảng project_stages
		CREATE TABLE project_stages (
			id VARCHAR(36) PRIMARY KEY,
			project_id VARCHAR(36),
			name VARCHAR(100) NOT NULL,
			description TEXT,
			status VARCHAR(20) NOT NULL,
			start_date DATE,
			end_date DATE,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (project_id) REFERENCES projects(id)
		);

		-- Bảng payments
		CREATE TABLE payments (
			id VARCHAR(36) PRIMARY KEY,
			project_id VARCHAR(36),
			amount DECIMAL(10, 2) NOT NULL,
			payment_date DATETIME2 NOT NULL,
			payment_method VARCHAR(50) NOT NULL,
			status VARCHAR(20) NOT NULL,
			notes TEXT,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (project_id) REFERENCES projects(id)
		);

		-- Bảng maintenance_requests
		CREATE TABLE maintenance_requests (
			id VARCHAR(36) PRIMARY KEY,
			customer_id VARCHAR(36),
			project_id VARCHAR(36),
			description TEXT,
			cost DECIMAL(10, 2),
			scheduled_date DATE,
			completion_date DATE,
			status VARCHAR(20) NOT NULL,
			assigned_to VARCHAR(36),
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (customer_id) REFERENCES users(id),
			FOREIGN KEY (project_id) REFERENCES projects(id),
			FOREIGN KEY (assigned_to) REFERENCES users(id)
		);

		-- Bảng blog_categories
		CREATE TABLE blog_categories (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
		);

		-- Bảng blog_posts
		CREATE TABLE blog_posts (
			id VARCHAR(36) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			content TEXT,
			author_id VARCHAR(36),
			category_id VARCHAR(36),
			image_url VARCHAR(255),
			status VARCHAR(20) NOT NULL,
			published_at DATETIME2,
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (author_id) REFERENCES users(id),
			FOREIGN KEY (category_id) REFERENCES blog_categories(id)
		);

		-- Bảng blog_post_categories
		CREATE TABLE blog_post_categories (
			id VARCHAR(36) PRIMARY KEY,
			blog_post_id VARCHAR(36),
			category_id VARCHAR(36),
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id),
			FOREIGN KEY (category_id) REFERENCES blog_categories(id)
		);

		-- Bảng reviews
		CREATE TABLE reviews (
			id VARCHAR(36) PRIMARY KEY,
			customer_id VARCHAR(36),
			project_id VARCHAR(36),
			maintenance_request_id VARCHAR(36),
			rating INT NOT NULL,
			comment TEXT,
			review_date DATETIME2 NOT NULL,
			status VARCHAR(20) NOT NULL,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			FOREIGN KEY (customer_id) REFERENCES users(id),
			FOREIGN KEY (project_id) REFERENCES projects(id),
			FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id)
		);

		-- Bảng cancellation_policies
		CREATE TABLE cancellation_policies (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			refund_percentage DECIMAL(5, 2) NOT NULL,
			time_limit INT NOT NULL,
			is_active BIT NOT NULL DEFAULT 1,
			created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
			updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
		);

		-- Bảng project_cancellations
		CREATE TABLE project_cancellations (
			id VARCHAR(36) PRIMARY KEY,
			project_id VARCHAR(36),
			policy_id VARCHAR(36),
			reason TEXT,
			requested_by VARCHAR(36),
			status VARCHAR(20) NOT NULL,
			refund_amount DECIMAL(10, 2),
			cancellation_date DATETIME2 NOT NULL,
			processed_by VARCHAR(36),
			processed_at DATETIME2,
			notes TEXT,
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
		('1', 'Manager', 'Quản lý dự án, nhân viên, tài khoản người dùng và phân quyền', 1, GETDATE(), GETDATE()),
		('2', 'Consulting Staff', 'Nhân viên tư vấn cho khách hàng', 1, GETDATE(), GETDATE()),
		('3', 'Design Staff', 'Nhân viên thiết kế hồ cá Koi', 1, GETDATE(), GETDATE()),
		('4', 'Construction Staff', 'Nhân viên thi công hồ cá Koi', 1, GETDATE(), GETDATE()),
		('5', 'Maintenance Staff', 'Nhân viên bảo dưỡng và chăm sóc hồ cá', 1, GETDATE(), GETDATE()),
		('6', 'Customer', 'Khách hàng sử dụng dịch vụ', 1, GETDATE(), GETDATE());

		-- Thêm dữ liệu vào bảng users
		INSERT INTO users (id, username, password, email, phone, full_name, role_id, is_active, created_at, updated_at)
		VALUES 
		('1', 'manager1', 'password123', 'manager1@koipond.com', '0987654321', 'John Manager', '1', 1, GETDATE(), GETDATE()),
		('2', 'consultant1', 'hashed_password_here', 'consultant1@koipond.com', '0987654322', 'Alice Consultant', '2', 1, GETDATE(), GETDATE()),
		('3', 'designer1', 'hashed_password_here', 'designer1@koipond.com', '0987654323', 'Bob Designer', '3', 1, GETDATE(), GETDATE()),
		('4', 'constructor1', 'hashed_password_here', 'constructor1@koipond.com', '0987654324', 'Charlie Constructor', '4', 1, GETDATE(), GETDATE()),
		('5', 'maintenance1', 'hashed_password_here', 'maintenance1@koipond.com', '0987654325', 'David Maintenance', '5', 1, GETDATE(), GETDATE()),
		('6', 'customer1', 'hashed_password_here', 'customer1@example.com', '0123456780', 'Eva Customer', '6', 1, GETDATE(), GETDATE()),
		('7', 'customer2', 'hashed_password_here', 'customer2@example.com', '0123456781', 'Frank Customer', '6', 1, GETDATE(), GETDATE());

		UPDATE users
SET password = '$2a$12$gShHO6BeIKRLOnYGGHa4YOZSR1Z2jUJiekkuccwb1wvyUAJGzm9Dm'
WHERE username = 'manager1';