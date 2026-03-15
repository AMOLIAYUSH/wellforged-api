-- Add pricing breakdown columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10, 2) DEFAULT 0;

-- Add item total to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS item_total DECIMAL(10, 2);

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('subtotal', 'discount_amount', 'shipping_amount')
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND column_name = 'item_total';
