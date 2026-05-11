-- ========================================================
-- 1. DATABASE CLEANUP & INITIALIZATION
-- ========================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS ticketing_event_db;
CREATE DATABASE ticketing_event_db;
USE ticketing_event_db;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 2. TABLE STRUCTURES
-- ========================================================

-- 1. Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    profile_image VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. Categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Venues
CREATE TABLE venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INT,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Events
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizer_id INT NOT NULL,
    category_id INT NOT NULL,
    venue_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description LONGTEXT,
    event_date DATETIME,
    event_end_date DATETIME,
    poster_image VARCHAR(255),
    status ENUM('draft', 'published', 'closed', 'cancelled') DEFAULT 'draft',
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. Subscription Plans
CREATE TABLE subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    duration_days INT DEFAULT 30,
    event_limit INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Ticket Types
CREATE TABLE ticket_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    quota INT NOT NULL,
    sold INT DEFAULT 0,
    status ENUM('available', 'sold_out', 'disabled') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. Order Headers
CREATE TABLE order_headers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    event_id INT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_status ENUM('pending', 'processing', 'paid', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    expired_at DATETIME,
    paid_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 9. Order Details
CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_header_id INT NOT NULL,
    ticket_type_id INT NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    qty INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
    qr_code LONGTEXT,
    checked_in_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_header_id) REFERENCES order_headers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 10. Payment Methods
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    provider VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================================
-- 3. INSERTING DUMMY DATA (MINIMAL 5 PER TABLE)
-- ========================================================

-- Roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Kelola sistem'),
('Organizer', 'Buat event'),
('Customer', 'Beli tiket');

-- Users
INSERT INTO users (role_id, full_name, email, password, phone) VALUES
(1, 'Super Admin', 'admin@event.com', 'hashed_pass_1', '081122334455'),
(2, 'Java Jazz Group', 'info@javajazz.com', 'hashed_pass_2', '08123456789'),
(2, 'Tech Conference Organizer', 'contact@techconf.id', 'hashed_pass_3', '08129876543'),
(3, 'Budi Santoso', 'budi@gmail.com', 'hashed_pass_4', '085511223344'),
(3, 'Siti Aminah', 'siti@gmail.com', 'hashed_pass_5', '085544332211'),
(3, 'Rendi Wijaya', 'rendi@gmail.com', 'hashed_pass_6', '085599887766');

-- Categories
INSERT INTO categories (name) VALUES
('Musik & Konser'), ('Seminar & Workshop'), ('Olahraga'), ('Seni & Budaya'), ('Teknologi & IT');

-- Venues
INSERT INTO venues (name, city, address, capacity) VALUES
('JIExpo Kemayoran', 'Jakarta', 'Jl. Benyamin Suaeb', 5000),
('ICE BSD', 'Tangerang', 'BSD City', 10000),
('Stadion Utama GBK', 'Jakarta', 'Senayan', 75000),
('Balai Kartini', 'Jakarta', 'Jl. Gatot Subroto', 3500),
('Jatim Expo', 'Surabaya', 'Jl. Ahmad Yani', 5000);

-- Events
INSERT INTO events (organizer_id, category_id, venue_id, title, status, event_date) VALUES
(2, 1, 1, 'Jakarta Jazz Night 2024', 'published', '2024-08-15 19:00:00'),
(3, 5, 2, 'AI Future Summit', 'published', '2024-09-10 09:00:00'),
(2, 4, 4, 'Wayang Heritage Show', 'published', '2024-08-20 20:00:00'),
(3, 2, 5, 'Digital Marketing 101', 'published', '2024-10-05 10:00:00'),
(2, 3, 3, 'Indonesia Marathon 2024', 'draft', '2024-11-12 05:00:00');

-- Subscription Plans
INSERT INTO subscription_plans (name, price, event_limit) VALUES
('Free', 0, 1),
('Pro', 99000, 10),
('Enterprise', 299000, 999),
('Starter', 49000, 3),
('Annual VIP', 2500000, 9999);

-- Ticket Types
INSERT INTO ticket_types (event_id, name, price, quota) VALUES
(1, 'Festival A', 250000.00, 500),
(1, 'VIP', 750000.00, 50),
(2, 'Early Bird', 150000.00, 100),
(3, 'Reguler', 100000.00, 300),
(4, 'Online Access', 50000.00, 1000);

-- Order Headers
INSERT INTO order_headers (user_id, order_code, event_id, total_amount, payment_status, payment_method) VALUES
(4, 'ORD-001', 1, 250000.00, 'paid', 'Transfer BCA'),
(5, 'ORD-002', 1, 500000.00, 'pending', 'GoPay'),
(6, 'ORD-003', 2, 150000.00, 'paid', 'Virtual Account'),
(4, 'ORD-004', 3, 100000.00, 'cancelled', 'OVO'),
(5, 'ORD-005', 4, 50000.00, 'paid', 'Kartu Kredit');

-- Order Details
INSERT INTO order_details (order_header_id, ticket_type_id, ticket_code, qty, price, subtotal) VALUES
(1, 1, 'TIX-001-AAA', 1, 250000.00, 250000.00),
(2, 1, 'TIX-002-BBB', 2, 250000.00, 500000.00),
(3, 3, 'TIX-003-CCC', 1, 150000.00, 150000.00),
(4, 4, 'TIX-004-DDD', 1, 100000.00, 100000.00),
(5, 5, 'TIX-005-EEE', 1, 50000.00, 50000.00);

-- Payment Methods
INSERT INTO payment_methods (name, provider) VALUES
('Transfer Bank', 'BCA'),
('E-Wallet', 'GoPay'),
('Virtual Account', 'BNI'),
('Credit Card', 'Midtrans'),
('Retail', 'Alfamart');

-- ========================================================
-- 4. VIEWS (FOR TESTING)
-- ========================================================

CREATE OR REPLACE VIEW v_events_summary AS
SELECT e.id, e.title, u.full_name AS organizer, v.name AS venue, e.event_date, e.status
FROM events e
JOIN users u ON e.organizer_id = u.id
JOIN venues v ON e.venue_id = v.id;

CREATE OR REPLACE VIEW v_sales_report AS
SELECT oh.order_code, u.full_name AS customer, e.title AS event, oh.total_amount, oh.payment_status
FROM order_headers oh
JOIN users u ON oh.user_id = u.id
JOIN events e ON oh.event_id = e.id;