
const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Wf_backend',
    password: 'Ayush@12',
    port: 5432
});

async function updateCoupons() {
    try {
        console.log('Deactivating old coupons...');
        await pool.query("UPDATE coupons SET is_active = false WHERE code IN ('WF05', 'WF10', 'WF20', 'WELLFORGED10')");

        console.log('Upserting Welcome coupons...');
        const coupons = [
            { code: 'WELCOME20', value: 20 },
            { code: 'WELCOME30', value: 30 },
            { code: 'WELCOME50', value: 50 },
            { code: 'Welcome20', value: 20 },
            { code: 'Welcome30', value: 30 },
            { code: 'Welcome50', value: 50 }
        ];

        for (const c of coupons) {
            await pool.query(
                "INSERT INTO coupons (code, discount_type, discount_value, expires_at, is_active) VALUES ($1, 'fixed', $2, '2026-12-31 23:59:59+05:30', true) ON CONFLICT (code) DO UPDATE SET discount_type = 'fixed', discount_value = EXCLUDED.discount_value, is_active = true",
                [c.code, c.value]
            );
        }

        const res = await pool.query("SELECT code, discount_type, discount_value, is_active FROM coupons WHERE is_active = true");
        console.log('Active coupons:', JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

updateCoupons();
