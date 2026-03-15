-- Add missing status columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'unfulfilled';

-- Rename status to current_status if needed? No, current_status exists, but controller uses status?
-- Wait, let's check order.controller.js (the old one) used status.
-- order.controller.ts used status in updateResult? No.

SELECT 'Orders status columns added' as status;
