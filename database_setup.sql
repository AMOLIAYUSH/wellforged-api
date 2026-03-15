-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    mobile_number VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin'
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES cart(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2),
    min_order_amount DECIMAL(10, 2),
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_till TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER DEFAULT 1000,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    address_id UUID REFERENCES addresses(id),
    address_snapshot JSONB, -- Stores the address at time of purchase
    coupon_id UUID REFERENCES coupons(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table (Mock)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report Batches (Inventory/Transparency)
CREATE TABLE IF NOT EXISTS report_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    batch_number VARCHAR(100) NOT NULL,
    testing_date DATE,
    tested_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, batch_number)
);

-- Report Test Results
CREATE TABLE IF NOT EXISTS report_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES report_batches(id),
    test_name VARCHAR(255) NOT NULL,
    test_value VARCHAR(100) NOT NULL,
    unit VARCHAR(50),
    pass_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report Check Logs
CREATE TABLE IF NOT EXISTS report_check_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID, 
    batch_number VARCHAR(100),
    fetch_status VARCHAR(50),
    ip_address VARCHAR(50),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    change_type VARCHAR(50),
    quantity_change INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- SEED DATA

-- User seed removed per request

-- Categories
INSERT INTO categories (name, slug, description) VALUES 
('Superfoods', 'superfoods', 'Nutrient-rich foods')
ON CONFLICT (slug) DO NOTHING;

-- Products
WITH cat AS (SELECT id FROM categories WHERE slug = 'superfoods' LIMIT 1)
INSERT INTO products (category_id, name, slug, sku, description, price, stock) VALUES
((SELECT id FROM cat), 'Moringa Powder - 100g', 'moringa-powder-100g', 'WF-MOR-100', 'Organic Moringa Leaf Powder', 349.00, 100),
((SELECT id FROM cat), 'Moringa Powder - 250g', 'moringa-powder-250g', 'WF-MOR-250', 'Organic Moringa Leaf Powder', 549.00, 100)
ON CONFLICT (slug) DO NOTHING;

-- Product Images
WITH prod AS (SELECT id FROM products WHERE slug = 'moringa-powder-100g' LIMIT 1)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
((SELECT id FROM prod), '/assets/Packaging_Updated.png', true);

-- Batch Reports for Transparency
WITH prod AS (SELECT id FROM products WHERE slug = 'moringa-powder-100g' LIMIT 1)
INSERT INTO report_batches (product_id, batch_number, testing_date, tested_by) VALUES
((SELECT id FROM prod), 'WF2026021212', '2026-02-12', 'ABC Labs')
ON CONFLICT (product_id, batch_number) DO NOTHING;

-- Test Results
WITH batch AS (SELECT id FROM report_batches WHERE batch_number = 'WF2026021212' LIMIT 1)
INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status) VALUES
((SELECT id FROM batch), 'Heavy Metals', 'Not Detected', 'ppm', true),
((SELECT id FROM batch), 'Pesticides', 'Not Detected', 'ppm', true),
((SELECT id FROM batch), 'Microbial', 'Pass', '', true),
((SELECT id FROM batch), 'Moisture', '4.5', '%', true);
