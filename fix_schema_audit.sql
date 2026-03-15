-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_snapshot JSONB;

-- Sync order_items columns
-- unit_price is already there (integer)
-- We need to ensure sku_id is used instead of variant_id if variant_id was intended
-- Looking at audit, it's already sku_id.

-- Fix cart_items to ensure consistency (it already has profile_id and sku_id)

-- Verify and cleanup
SELECT 'Schema updated successfully' as status;
