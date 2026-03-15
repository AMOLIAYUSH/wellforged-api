import type { Response } from 'express';
import pool from '../config/db.js';

export const getAddresses = async (req: any, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM addresses WHERE profile_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAddress = async (req: any, res: Response) => {
    const { full_name, mobile_number, address_line1, city, state, pincode, is_default } = req.body;

    try {
        if (is_default) {
            await pool.query('UPDATE addresses SET is_default = false WHERE profile_id = $1', [req.user.id]);
        }

        const result = await pool.query(
            `INSERT INTO addresses (profile_id, full_name, phone, address_line1, city, state, pincode, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [req.user.id, full_name, mobile_number, address_line1, city, state, pincode, is_default]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAddress = async (req: any, res: Response) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM addresses WHERE id = $1 AND profile_id = $2', [id, req.user.id]);
        res.json({ message: 'Address deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
