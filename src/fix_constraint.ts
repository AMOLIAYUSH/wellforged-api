import pool from './config/db.js';

async function fixConstraint() {
    try {
        console.log("Dropping constraint 'profiles_id_fkey'...");
        await pool.query(`
            ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
        `);
        console.log("Constraint dropped successfully.");
    } catch (err) {
        console.error("Error dropping constraint:", err);
    } finally {
        await pool.end();
    }
}

fixConstraint();
