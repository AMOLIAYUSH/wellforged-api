-- Migration: Paisa (INTEGER) to Rupees (DECIMAL(10, 2))

-- 1. Table: skus
ALTER TABLE skus ALTER COLUMN price TYPE DECIMAL(10, 2) USING price::DECIMAL / 100;
-- original_price might not exist for some, let's check first or use ADD/ALTER if exists pattern
-- Based on audit original_price wasn't listed, but code uses it. 
-- Just in case it's added later or I missed it in audit.

-- 2. Table: orders
ALTER TABLE orders ALTER COLUMN total_amount TYPE DECIMAL(10, 2) USING total_amount::DECIMAL / 100;
ALTER TABLE orders ALTER COLUMN discount_amount TYPE DECIMAL(10, 2) USING discount_amount::DECIMAL / 100;
ALTER TABLE orders ALTER COLUMN subtotal TYPE DECIMAL(10, 2) USING subtotal::DECIMAL / 100;
ALTER TABLE orders ALTER COLUMN shipping_amount TYPE DECIMAL(10, 2) USING shipping_amount::DECIMAL / 100;

-- 3. Table: order_items
ALTER TABLE order_items ALTER COLUMN unit_price TYPE DECIMAL(10, 2) USING unit_price::DECIMAL / 100;
ALTER TABLE order_items ALTER COLUMN item_total TYPE DECIMAL(10, 2) USING item_total::DECIMAL / 100;

-- 4. Table: coupons
ALTER TABLE coupons ALTER COLUMN discount_value TYPE DECIMAL(10, 2) USING discount_value::DECIMAL / 100;
ALTER TABLE coupons ALTER COLUMN min_order_value TYPE DECIMAL(10, 2) USING min_order_value::DECIMAL / 100;

-- 5. Table: payments
ALTER TABLE payments ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::DECIMAL / 100;

-- 6. Table: returns
ALTER TABLE returns ALTER COLUMN refund_amount TYPE DECIMAL(10, 2) USING refund_amount::DECIMAL / 100;

SELECT 'Currency migration to DECIMAL(10, 2) completed' as status;
