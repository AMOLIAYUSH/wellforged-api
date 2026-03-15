-- Add item_total to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_total INTEGER DEFAULT 0;

-- Ensure sku_id and unit_price are the names
-- (Audit already confirmed unit_price and sku_id exist)

SELECT 'Order items schema updated' as status;
