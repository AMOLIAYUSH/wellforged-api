ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_orders_profile_idempotency ON orders(profile_id, idempotency_key);
