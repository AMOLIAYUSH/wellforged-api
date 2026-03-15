import pool from './config/db.js';
import fs from 'fs';

async function auditDatabase() {
    let output = "# Database Audit Report\n\n";
    const log = (msg: string) => {
        console.log(msg);
        output += msg + "\n";
    };

    try {
        log("## 1. Tables Overview");
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        log(`Total Tables: ${tables.rows.length}`);
        tables.rows.forEach(r => log(`- ${r.table_name}`));

        log("\n## 2. Table Schemas & Data Counts");
        for (const table of tables.rows.map(r => r.table_name)) {
            log(`\n### Table: ${table}`);

            // Count rows
            const countRes = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
            log(`Row Count: ${countRes.rows[0].count}`);

            // Get columns
            const cols = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            log("| Column | Type | Nullable | Default |");
            log("|---|---|---|---|");
            cols.rows.forEach(c => {
                log(`| ${c.column_name} | ${c.data_type} | ${c.is_nullable} | ${c.column_default || ''} |`);
            });
        }

        log("\n## 3. Foreign Key Relationships");
        const fks = await pool.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            ORDER BY tc.table_name;
        `);
        log("| Table | Column | References | Foreign Column |");
        log("|---|---|---|---|");
        fks.rows.forEach(f => {
            log(`| ${f.table_name} | ${f.column_name} | ${f.foreign_table_name} | ${f.foreign_column_name} |`);
        });

        fs.writeFileSync('audit_report.md', output);
        log("\nAudit report written to audit_report.md");

    } catch (err: any) {
        log(`\nERROR DURING AUDIT: ${err.message}`);
    } finally {
        await pool.end();
    }
}

auditDatabase();
