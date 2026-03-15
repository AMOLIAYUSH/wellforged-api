import pool from './config/db.js';

async function checkConstraints() {
    try {
        const result = await pool.query(`
            SELECT 
                conname as constraint_name, 
                pg_get_constraintdef(c.oid) as constraint_definition
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'cart_items'::regclass;
        `);
        console.table(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkConstraints();
