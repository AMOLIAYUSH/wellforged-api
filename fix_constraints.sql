-- Fix cart_items missing unique constraint
ALTER TABLE cart_items ADD CONSTRAINT cart_items_profile_sku_unique UNIQUE (profile_id, sku_id);

-- Cleanup duplicate addresses (keep only one per unique set of values)
DELETE FROM addresses
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY profile_id, full_name, phone, address_line1, city, state, pincode 
                   ORDER BY created_at ASC
               ) as row_num
        FROM addresses
    ) t
    WHERE t.row_num > 1
);

-- Add a unique constraint to addresses to prevent this in the future
ALTER TABLE addresses ADD CONSTRAINT addresses_unique_per_profile UNIQUE (profile_id, full_name, phone, address_line1, city, state, pincode);

SELECT 'Constraints added and duplicates cleaned successfully' as status;
