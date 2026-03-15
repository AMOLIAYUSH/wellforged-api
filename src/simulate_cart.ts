import pool from './config/db.js';

async function simulateAddToCart() {
    const profile_id = '401ac0a6-4e6f-446d-9041-937e642473cc'; // From check_state.ts

    try {
        // Get a valid SKU ID first
        const skuResult = await pool.query("SELECT id, price FROM skus LIMIT 1");
        if (skuResult.rows.length === 0) {
            console.log("No SKUs found");
            return;
        }
        const sku_id = skuResult.rows[0].id;
        const sku_price = skuResult.rows[0].price;
        console.log(`Using SKU: ${sku_id}, Price: ${sku_price}`);

        // Try adding to cart
        const itemResult = await pool.query(
            `INSERT INTO cart_items (profile_id, sku_id, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (profile_id, sku_id) 
       DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
            [profile_id, sku_id, 1]
        );
        console.log("Added to cart successfully:");
        console.table(itemResult.rows);

        // Verify
        const verify = await pool.query("SELECT ci.*, s.price FROM cart_items ci JOIN skus s ON ci.sku_id = s.id WHERE ci.profile_id = $1", [profile_id]);
        console.log("Current Cart Items for this profile with Prices:");
        console.table(verify.rows);

    } catch (err: any) {
        console.error("Simulation failed:", err);
    } finally {
        await pool.end();
    }
}

simulateAddToCart();
