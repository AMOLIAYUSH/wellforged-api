-- =============================================================
-- WellForged Backend Schema (INTEGER IDs)
-- Drop existing tables and recreate with SERIAL primary keys
-- =============================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS report_test_results CASCADE;
DROP TABLE IF EXISTS report_batches CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS product_metadata CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS skus CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================================
-- 1. PROFILES (Users / Admins)
-- =============================================================
CREATE TABLE profiles (
    id          SERIAL PRIMARY KEY,
    full_name   VARCHAR(200),
    email       VARCHAR(255) UNIQUE,
    phone       VARCHAR(20) UNIQUE NOT NULL,
    role        VARCHAR(20) DEFAULT 'customer',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 2. ADDRESSES
-- =============================================================
CREATE TABLE addresses (
    id             SERIAL PRIMARY KEY,
    profile_id     INT REFERENCES profiles(id) ON DELETE CASCADE,
    full_name      VARCHAR(200) NOT NULL,
    mobile_number  VARCHAR(20) NOT NULL,
    address_line1  TEXT NOT NULL,
    address_line2  TEXT,
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    pincode        VARCHAR(20) NOT NULL,
    is_default     BOOLEAN DEFAULT false,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 3. CATEGORIES
-- =============================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 4. PRODUCTS
-- =============================================================
CREATE TABLE products (
    id               SERIAL PRIMARY KEY,
    category_id      INT REFERENCES categories(id) ON DELETE SET NULL,
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) UNIQUE NOT NULL,
    base_description TEXT,
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 5. SKUs (Variants)
-- =============================================================
CREATE TABLE skus (
    id             SERIAL PRIMARY KEY,
    product_id     INT REFERENCES products(id) ON DELETE CASCADE,
    sku_code       VARCHAR(100) UNIQUE NOT NULL,
    label          VARCHAR(100) NOT NULL,
    price          DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock          INTEGER DEFAULT 0,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 6. PRODUCT IMAGES
-- =============================================================
CREATE TABLE product_images (
    id            SERIAL PRIMARY KEY,
    product_id    INT REFERENCES products(id) ON DELETE CASCADE,
    image_url     TEXT NOT NULL,
    is_main       BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 7. PRODUCT METADATA (highlights, specs, ingredients)
-- =============================================================
CREATE TABLE product_metadata (
    id            SERIAL PRIMARY KEY,
    product_id    INT REFERENCES products(id) ON DELETE CASCADE,
    category      VARCHAR(50) NOT NULL,
    key           VARCHAR(255) NOT NULL,
    value         TEXT,
    icon_name     VARCHAR(100),
    display_order INTEGER DEFAULT 0
);

-- =============================================================
-- 8. FAQs
-- =============================================================
CREATE TABLE faqs (
    id            SERIAL PRIMARY KEY,
    product_id    INT REFERENCES products(id) ON DELETE CASCADE,
    question      TEXT NOT NULL,
    answer        TEXT NOT NULL,
    is_active     BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- =============================================================
-- 9. CART ITEMS (for logged-in users only; guests use localStorage)
-- =============================================================
CREATE TABLE cart_items (
    id         SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
    sku_id     INT REFERENCES skus(id) ON DELETE CASCADE,
    quantity   INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, sku_id)
);

-- =============================================================
-- 10. COUPONS
-- =============================================================
CREATE TABLE coupons (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(50) UNIQUE NOT NULL,
    discount_type       VARCHAR(20) DEFAULT 'fixed',
    discount_value      DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_order_value     DECIMAL(10,2),
    expires_at          TIMESTAMP WITH TIME ZONE,
    max_uses            INTEGER DEFAULT 1000,
    used_count          INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 11. ORDERS (supports guests: profile_id nullable)
-- =============================================================
CREATE TABLE orders (
    id                  SERIAL PRIMARY KEY,
    order_number        VARCHAR(100) UNIQUE NOT NULL,
    profile_id          INT REFERENCES profiles(id) ON DELETE SET NULL,
    idempotency_key     VARCHAR(255),
    address_snapshot    JSONB NOT NULL,
    coupon_id           INT REFERENCES coupons(id) ON DELETE SET NULL,
    subtotal            DECIMAL(10,2) NOT NULL,
    discount_amount     DECIMAL(10,2) DEFAULT 0,
    total_amount        DECIMAL(10,2) NOT NULL,
    payment_status      VARCHAR(50) DEFAULT 'pending',
    fulfillment_status  VARCHAR(50) DEFAULT 'unfulfilled',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_profile_idempotency ON orders(profile_id, idempotency_key);

-- =============================================================
-- 12. ORDER ITEMS
-- =============================================================
CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INT REFERENCES orders(id) ON DELETE CASCADE,
    sku_id     INT REFERENCES skus(id) ON DELETE SET NULL,
    quantity   INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    item_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 13. PAYMENTS
-- =============================================================
CREATE TABLE payments (
    id                  SERIAL PRIMARY KEY,
    order_id            INT REFERENCES orders(id) ON DELETE CASCADE,
    payment_method      VARCHAR(50),
    amount              DECIMAL(10,2) NOT NULL,
    status              VARCHAR(50) DEFAULT 'captured',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 14. TRANSPARENCY: REPORT BATCHES
-- =============================================================
CREATE TABLE report_batches (
    id           SERIAL PRIMARY KEY,
    product_id   INT REFERENCES products(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    testing_date DATE,
    tested_by    VARCHAR(255),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, batch_number)
);

-- =============================================================
-- 15. TRANSPARENCY: TEST RESULTS
-- =============================================================
CREATE TABLE report_test_results (
    id          SERIAL PRIMARY KEY,
    batch_id    INT REFERENCES report_batches(id) ON DELETE CASCADE,
    test_name   VARCHAR(255) NOT NULL,
    test_value  VARCHAR(100) NOT NULL,
    unit        VARCHAR(50),
    pass_status BOOLEAN DEFAULT true,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================
-- SEED DATA
-- =============================================================

-- Admin profile
INSERT INTO profiles (full_name, email, phone, role)
VALUES ('Ayush Admin', 'admin@wellforged.in', '9999999999', 'admin');

-- Category
INSERT INTO categories (name, slug, description)
VALUES ('Superfoods', 'superfoods', 'Clean, single-ingredient superfoods crafted for performance.');

-- Product
INSERT INTO products (category_id, name, slug, base_description, is_active)
VALUES (
    (SELECT id FROM categories WHERE slug = 'superfoods'),
    'Moringa Powder',
    'moringa-powder',
    'Pure, nutrient-rich moringa powder — lab tested, no fillers, nothing hidden. Sourced from the finest farms and cold-processed to preserve maximum potency.',
    true
);

-- SKUs / Variants
INSERT INTO skus (product_id, sku_code, label, price, original_price, stock) VALUES
((SELECT id FROM products WHERE slug='moringa-powder'), 'WF-MOR-100', '100g Pouch', 349.00, 499.00, 150),
((SELECT id FROM products WHERE slug='moringa-powder'), 'WF-MOR-250', '250g Jar',   549.00, 899.00, 80);

-- Product Image
INSERT INTO product_images (product_id, image_url, is_main, display_order)
VALUES ((SELECT id FROM products WHERE slug='moringa-powder'), '/Packaging_Updated.png', true, 1);

-- Product Metadata: highlights
INSERT INTO product_metadata (product_id, category, key, value, icon_name, display_order) VALUES
((SELECT id FROM products WHERE slug='moringa-powder'), 'highlight', 'Lab Tested',         'Third-party tested for heavy metals, pesticides & microbials',    'FlaskConical', 1),
((SELECT id FROM products WHERE slug='moringa-powder'), 'highlight', 'No Fillers',          'Pure moringa leaf powder — zero additives, zero compromise',        'ShieldCheck',  2),
((SELECT id FROM products WHERE slug='moringa-powder'), 'highlight', 'Cold Processed',      'Processed below 40°C to preserve heat-sensitive nutrients',         'Snowflake',    3),
((SELECT id FROM products WHERE slug='moringa-powder'), 'highlight', 'Sustainably Sourced', 'Farmed using regenerative agricultural practices',                  'Leaf',         4);

-- Product Metadata: specs
INSERT INTO product_metadata (product_id, category, key, value, icon_name, display_order) VALUES
((SELECT id FROM products WHERE slug='moringa-powder'), 'spec', 'Protein',       '27g per 100g',    NULL, 1),
((SELECT id FROM products WHERE slug='moringa-powder'), 'spec', 'Iron',          '28mg per 100g',   NULL, 2),
((SELECT id FROM products WHERE slug='moringa-powder'), 'spec', 'Calcium',       '185mg per 100g',  NULL, 3),
((SELECT id FROM products WHERE slug='moringa-powder'), 'spec', 'Vitamin C',     '220mg per 100g',  NULL, 4),
((SELECT id FROM products WHERE slug='moringa-powder'), 'spec', 'Serving Size',  '1 tsp (3g)',      NULL, 5),
((SELECT id FROM products WHERE slug='moringa-powder'), 'spec', 'Shelf Life',    '18 months',       NULL, 6);

-- FAQs
INSERT INTO faqs (product_id, question, answer, is_active, display_order) VALUES
((SELECT id FROM products WHERE slug='moringa-powder'),
 'How do I consume this?',
 'Mix 1 tsp (3g) in water, smoothies, or any beverage. Best taken in the morning or before a workout.',
 true, 1),
((SELECT id FROM products WHERE slug='moringa-powder'),
 'Is it safe during pregnancy?',
 'Consult your physician before consuming any supplement during pregnancy.',
 true, 2),
((SELECT id FROM products WHERE slug='moringa-powder'),
 'Does it have any additives?',
 'No. This is 100% pure moringa leaf powder. Nothing added, nothing removed.',
 true, 3),
((SELECT id FROM products WHERE slug='moringa-powder'),
 'How is it stored?',
 'Store in a cool, dry place away from direct sunlight. Reseal after each use.',
 true, 4);

-- Batch Reports: Batch 1 (Feb 2026)
INSERT INTO report_batches (product_id, batch_number, testing_date, tested_by)
VALUES ((SELECT id FROM products WHERE slug='moringa-powder'), 'WF2026021212', '2026-02-12', 'ABC Analytical Labs, Bengaluru');

INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status)
SELECT id, test_name, test_value, unit, pass_status FROM report_batches, (VALUES
    ('Heavy Metals (Lead)',    'Not Detected', 'ppm',  true),
    ('Heavy Metals (Mercury)', 'Not Detected', 'ppm',  true),
    ('Heavy Metals (Arsenic)', 'Not Detected', 'ppm',  true),
    ('Pesticide Residues',     'Not Detected', 'ppm',  true),
    ('Microbial Count',        'Pass',         '',     true),
    ('Moisture Content',       '4.5',          '%',    true),
    ('Protein Content',        '27.2',         'g/100g', true)
) AS data(test_name, test_value, unit, pass_status)
WHERE report_batches.batch_number = 'WF2026021212';

-- Batch Reports: Batch 2 (Jan 2026)
INSERT INTO report_batches (product_id, batch_number, testing_date, tested_by)
VALUES ((SELECT id FROM products WHERE slug='moringa-powder'), 'WF2026011501', '2026-01-15', 'MicroChem Labs, Hyderabad');

INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status)
SELECT id, test_name, test_value, unit, pass_status FROM report_batches, (VALUES
    ('Heavy Metals (Lead)',    'Not Detected', 'ppm',  true),
    ('Heavy Metals (Mercury)', 'Not Detected', 'ppm',  true),
    ('Heavy Metals (Arsenic)', 'Not Detected', 'ppm',  true),
    ('Pesticide Residues',     'Not Detected', 'ppm',  true),
    ('Microbial Count',        'Pass',         '',     true),
    ('Moisture Content',       '4.8',          '%',    true)
) AS data(test_name, test_value, unit, pass_status)
WHERE report_batches.batch_number = 'WF2026011501';

-- Demo Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, expires_at, is_active) VALUES
('SAVE20', 'fixed', 20.00, 349.00, '2026-12-31 23:59:59+05:30', true),
('SAVE30', 'fixed', 30.00, 549.00, '2026-12-31 23:59:59+05:30', true),
('SAVE50', 'fixed', 50.00, 890.00, '2026-12-31 23:59:59+05:30', true),
('SAVE100', 'fixed', 100.00, 1500.00, '2026-12-31 23:59:59+05:30', true);
