-- Insert test coupons for WellForged

-- 1. WELCOME10 - 10% off, minimum order ₹500, max discount ₹100
INSERT INTO coupons (
    code, 
    discount_type, 
    discount_percentage, 
    discount_value,
    min_order_amount, 
    max_discount_amount,
    max_uses,
    used_count,
    valid_from,
    valid_till,
    is_active
) VALUES (
    'WELCOME10',
    'percentage',
    10,
    0,
    500,
    100,
    100,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    true
) ON CONFLICT (code) DO NOTHING;

-- 2. FIRST50 - ₹50 flat off, no minimum order
INSERT INTO coupons (
    code, 
    discount_type, 
    discount_percentage, 
    discount_value,
    min_order_amount, 
    max_discount_amount,
    max_uses,
    used_count,
    valid_from,
    valid_till,
    is_active
) VALUES (
    'FIRST50',
    'fixed',
    0,
    50,
    NULL,
    NULL,
    50,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '60 days',
    true
) ON CONFLICT (code) DO NOTHING;

-- 3. MEGA20 - 20% off, minimum order ₹1000, max discount ₹200
INSERT INTO coupons (
    code, 
    discount_type, 
    discount_percentage, 
    discount_value,
    min_order_amount, 
    max_discount_amount,
    max_uses,
    used_count,
    valid_from,
    valid_till,
    is_active
) VALUES (
    'MEGA20',
    'percentage',
    20,
    0,
    1000,
    200,
    20,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '15 days',
    true
) ON CONFLICT (code) DO NOTHING;

-- Verify coupons were inserted
SELECT code, discount_type, discount_percentage, discount_value, min_order_amount, max_discount_amount, is_active
FROM coupons 
ORDER BY created_at DESC;
