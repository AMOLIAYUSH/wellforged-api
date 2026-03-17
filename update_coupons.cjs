const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "Wf_backend",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT || 5432),
});

const coupons = [
  { code: "SAVE20", value: 20, minOrderValue: 349 },
  { code: "SAVE30", value: 30, minOrderValue: 549 },
  { code: "SAVE50", value: 50, minOrderValue: 890 },
  { code: "SAVE100", value: 100, minOrderValue: 1500 },
];

async function updateCoupons() {
  try {
    console.log("Deactivating currently active coupons...");
    await pool.query("UPDATE coupons SET is_active = false WHERE is_active = true");

    console.log("Upserting subtotal-based coupons...");
    for (const coupon of coupons) {
      await pool.query(
        `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, expires_at, max_uses, used_count, is_active)
         VALUES ($1, 'fixed', $2, $3, '2026-12-31 23:59:59+05:30', 1000, 0, true)
         ON CONFLICT (code) DO UPDATE
         SET discount_type = 'fixed',
             discount_value = EXCLUDED.discount_value,
             min_order_value = EXCLUDED.min_order_value,
             expires_at = EXCLUDED.expires_at,
             max_uses = EXCLUDED.max_uses,
             used_count = 0,
             is_active = true`,
        [coupon.code, coupon.value, coupon.minOrderValue],
      );
    }

    const res = await pool.query(
      "SELECT code, discount_value, min_order_value, is_active FROM coupons WHERE is_active = true ORDER BY min_order_value ASC",
    );
    console.log("Active coupons:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

updateCoupons();
