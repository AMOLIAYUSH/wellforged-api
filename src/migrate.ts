import pool from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const sqlFile = process.argv[2];
    if (!sqlFile) {
        console.error("Please provide a SQL file name");
        process.exit(1);
    }

    const sqlPath = path.join(__dirname, '..', sqlFile);
    try {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Executing migration from ${sqlFile}...`);
        await pool.query(sql);
        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
