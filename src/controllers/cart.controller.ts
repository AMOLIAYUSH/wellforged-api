import type { Response } from 'express';
import pool from '../config/db.js';

export const getCart = async (req: any, res: Response) => {
    try {
        // Get items directly linked to profile_id in the new schema
        const itemsResult = await pool.query(
            `SELECT ci.*, s.label, s.price, s.sku_code, p.name, p.slug,
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = true LIMIT 1) as image_url
       FROM cart_items ci 
       JOIN skus s ON ci.sku_id = s.id
       JOIN products p ON s.product_id = p.id 
       WHERE ci.profile_id = $1`,
            [req.user.id]
        );

        res.json({
            items: itemsResult.rows
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req: any, res: Response) => {
    const { sku_id, quantity } = req.body;

    try {
        // Add or update item directly in cart_items using profile_id
        const itemResult = await pool.query(
            `INSERT INTO cart_items (profile_id, sku_id, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (profile_id, sku_id) 
       DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
            [req.user.id, sku_id, quantity]
        );

        res.status(201).json(itemResult.rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCartItem = async (req: any, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const result = await pool.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND profile_id = $3 RETURNING *',
            [quantity, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeCartItem = async (req: any, res: Response) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM cart_items WHERE id = $1 AND profile_id = $2', [id, req.user.id]);
        res.json({ message: 'Item removed from cart' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeCartItemByProductId = async (req: any, res: Response) => {
    // Note: In new schema we use sku_id, but if frontend still sends productId, we handle it
    const { productId } = req.params;

    try {
        await pool.query(
            'DELETE FROM cart_items WHERE profile_id = $1 AND sku_id IN (SELECT id FROM skus WHERE product_id = $2)',
            [req.user.id, productId]
        );
        res.json({ message: 'Product removed from cart' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkAddToCart = async (req: any, res: Response) => {
    const { items } = req.body; // Array of { sku_id, quantity }

    if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'items must be an array' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const item of items) {
            await client.query(
                `INSERT INTO cart_items (profile_id, sku_id, quantity) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (profile_id, sku_id) 
                 DO UPDATE SET quantity = cart_items.quantity + $3`,
                [req.user.id, item.sku_id, item.quantity]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Cart synced successfully' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
};
