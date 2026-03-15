import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Wf_backend',
    password: 'Ayush@12',
    port: 5432
});

try {
    await client.connect();
    console.log('✅ Connected to Wf_backend');
    const sql = fs.readFileSync(path.join(__dirname, 'new_schema.sql'), 'utf8');
    await client.query(sql);
    console.log('✅ Schema executed successfully!');

    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('\n📦 Tables:', tables.rows.map(r => r.table_name).join(', '));

    const skus = await client.query('SELECT s.label, s.price, s.stock, p.name FROM skus s JOIN products p ON s.product_id = p.id');
    console.log('\n🛒 SKUs:');
    skus.rows.forEach(r => console.log(`  ${r.name} | ${r.label} | ₹${r.price} | Stock: ${r.stock}`));

    const batches = await client.query('SELECT rb.batch_number, rb.tested_by, COUNT(rtr.id) as test_count FROM report_batches rb LEFT JOIN report_test_results rtr ON rb.id = rtr.batch_id GROUP BY rb.id, rb.batch_number, rb.tested_by');
    console.log('\n🔬 Batches:');
    batches.rows.forEach(r => console.log(`  ${r.batch_number} by ${r.tested_by} — ${r.test_count} tests`));

    const coupons = await client.query('SELECT code, discount_type, discount_value FROM coupons');
    console.log('\n🏷️ Coupons:', coupons.rows.map(r => `${r.code} (${r.discount_value}${r.discount_type === 'percentage' ? '%' : '₹'} off)`).join(', '));

} catch (e) {
    console.error('❌ Error:', e.message);
} finally {
    await client.end();
}
