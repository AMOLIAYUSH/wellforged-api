import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ...(process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' && {
        ssl: {
            rejectUnauthorized: false
        }
    })
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process in development, just log
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
