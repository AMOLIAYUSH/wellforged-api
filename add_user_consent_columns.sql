-- Add user consent tracking columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('terms_accepted', 'whatsapp_opt_in')
ORDER BY column_name;
