-- Add missing columns to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- We keep the old 'method' and 'status' if they were used, but controller uses these new ones
SELECT 'Payments schema updated' as status;
