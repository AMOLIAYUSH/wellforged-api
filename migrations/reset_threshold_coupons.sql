UPDATE coupons
SET is_active = false
WHERE is_active = true;

INSERT INTO coupons (
    code,
    discount_type,
    discount_value,
    min_order_value,
    expires_at,
    max_uses,
    used_count,
    is_active
) VALUES
    ('SAVE20', 'fixed', 20, 349, '2026-12-31 23:59:59+05:30', 1000, 0, true),
    ('SAVE30', 'fixed', 30, 549, '2026-12-31 23:59:59+05:30', 1000, 0, true),
    ('SAVE50', 'fixed', 50, 890, '2026-12-31 23:59:59+05:30', 1000, 0, true),
    ('SAVE100', 'fixed', 100, 1500, '2026-12-31 23:59:59+05:30', 1000, 0, true)
ON CONFLICT (code) DO UPDATE
SET
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    min_order_value = EXCLUDED.min_order_value,
    expires_at = EXCLUDED.expires_at,
    max_uses = EXCLUDED.max_uses,
    used_count = 0,
    is_active = true;
