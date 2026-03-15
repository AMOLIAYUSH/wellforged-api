import pool from './config/db.js';

async function checkCartAndOrders() {
    try {
        console.log("--- Cart Items ---");
        const cartItems = await pool.query("SELECT * FROM cart_items");
        console.table(cartItems.rows);

        console.log("\n--- Orders ---");
        const orders = await pool.query("SELECT id, profile_id, order_number, total_amount, current_status FROM orders");
        console.table(orders.rows);

        console.log("\n--- Addresses ---");
        const addresses = await pool.query("SELECT id, profile_id, full_name, phone, address_line1 FROM addresses");
        console.table(addresses.rows);

        console.log("\n--- Profiles ---");
        const profiles = await pool.query("SELECT id, full_name, phone FROM profiles");
        console.table(profiles.rows);

    } catch (err: any) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkCartAndOrders();
