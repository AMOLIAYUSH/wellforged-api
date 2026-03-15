import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    const { name, slug } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *',
            [name, slug]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
