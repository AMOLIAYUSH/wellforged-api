import pool from './config/db.js';

async function migrate() {
    try {
        console.log("Starting migration: Adding razorpay_order_id to orders table...");
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;");
        console.log("SUCCESS: razorpay_order_id column added (if it wasn't there already).");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
