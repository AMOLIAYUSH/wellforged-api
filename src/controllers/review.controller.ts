import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const getReviews = async (req: Request, res: Response) => {
    try {
        const { product_id, slug } = req.query;
        let queryStr = `
            SELECT r.*, p.full_name as user_name
            FROM product_reviews r
            LEFT JOIN profiles p ON r.profile_id = p.id
            JOIN products prod ON r.product_id = prod.id
            WHERE r.status = 'approved'
        `;
        const params: any[] = [];

        if (product_id) {
            params.push(product_id);
            queryStr += ` AND r.product_id = $${params.length}`;
        } else if (slug) {
            params.push(slug);
            queryStr += ` AND prod.slug = $${params.length}`;
        }

        queryStr += ' ORDER BY r.created_at DESC';

        const result = await pool.query(queryStr, params);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createReview = async (req: Request, res: Response) => {
    const { product_id, profile_id, order_id, rating, highlight, comment } = req.body;

    try {
        // Simple verification: if order_id is provided, check if it belongs to the profile and contains the product
        let is_verified = false;
        if (order_id && profile_id) {
            const orderCheck = await pool.query(
                `SELECT oi.id 
                 FROM orders o 
                 JOIN order_items oi ON o.id = oi.order_id 
                 JOIN skus s ON oi.sku_id = s.id
                 WHERE o.id = $1 AND o.profile_id = $2 AND s.product_id = $3`,
                [order_id, profile_id, product_id]
            );
            if (orderCheck.rows.length > 0) {
                is_verified = true;
            }
        }

        const result = await pool.query(
            `INSERT INTO product_reviews 
            (product_id, profile_id, order_id, rating, highlight, comment, is_verified, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [product_id, profile_id, order_id, rating, highlight, comment, is_verified, 'approved']
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
