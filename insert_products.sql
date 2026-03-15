-- Insert Categories
INSERT INTO categories (name, slug, description) VALUES 
('Superfoods', 'superfoods', 'Nutrient-rich foods')
ON CONFLICT (slug) DO NOTHING;

-- Insert Products
WITH cat AS (SELECT id FROM categories WHERE slug = 'superfoods' LIMIT 1)
INSERT INTO products (category_id, name, slug, sku, description, price, stock) VALUES
((SELECT id FROM cat), 'Moringa Powder - 100g', 'moringa-powder-100g', 'WF-MOR-100', 'Organic Moringa Leaf Powder', 349.00, 100),
((SELECT id FROM cat), 'Moringa Powder - 250g', 'moringa-powder-250g', 'WF-MOR-250', 'Organic Moringa Leaf Powder', 549.00, 100)
ON CONFLICT (slug) DO NOTHING;

-- Insert Product Images
WITH prod AS (SELECT id FROM products WHERE slug = 'moringa-powder-100g' LIMIT 1)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
((SELECT id FROM prod), '/assets/Packaging_Updated.png', true)
ON CONFLICT DO NOTHING;

-- Insert Batch Reports for Transparency
WITH prod AS (SELECT id FROM products WHERE slug = 'moringa-powder-100g' LIMIT 1)
INSERT INTO report_batches (product_id, batch_number, testing_date, tested_by) VALUES
((SELECT id FROM prod), 'WF2026021212', '2026-02-12', 'ABC Labs')
ON CONFLICT (product_id, batch_number) DO NOTHING;

-- Insert Test Results
WITH batch AS (SELECT id FROM report_batches WHERE batch_number = 'WF2026021212' LIMIT 1)
INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status) VALUES
((SELECT id FROM batch), 'Heavy Metals', 'Not Detected', 'ppm', true),
((SELECT id FROM batch), 'Pesticides', 'Not Detected', 'ppm', true),
((SELECT id FROM batch), 'Microbial', 'Pass', '', true),
((SELECT id FROM batch), 'Moisture', '4.5', '%', true)
ON CONFLICT DO NOTHING;

-- Verify products were inserted
SELECT id, name, slug, price, stock FROM products;
