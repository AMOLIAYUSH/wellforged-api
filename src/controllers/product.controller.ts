import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { normalizePublicUrl } from '../utils/publicUrls.js';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, search } = req.query;
        // Joint query to get product and its variants (taking first variant for base price/stock)
        let queryStr = `
            SELECT p.*,
            v.price as base_price, v.stock as total_stock
            FROM products p 
            LEFT JOIN LATERAL (
                SELECT price, stock 
                FROM skus 
                WHERE product_id = p.id 
                ORDER BY price ASC LIMIT 1
            ) v ON true
            WHERE 1=1
        `;
        const params: any[] = [];

        if (search) {
            params.push(`%${search}%`);
            queryStr += ` AND (p.name ILIKE $${params.length} OR p.base_description ILIKE $${params.length})`;
        }

        queryStr += ' ORDER BY p.created_at DESC';

        const result = await pool.query(queryStr, params);
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(
            'SELECT p.* FROM products p WHERE p.slug = $1',
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = result.rows[0];

        // Fetch variants (SKUs)
        const variants = await pool.query(
            'SELECT * FROM skus WHERE product_id = $1 ORDER BY price ASC',
            [product.id]
        );
        product.variants = variants.rows;

        // Fetch images
        const images = await pool.query(
            'SELECT id, image_url, is_main as is_primary, display_order as sort_order FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
            [product.id]
        );
        product.images = images.rows.map((row: any) => ({
            ...row,
            image_url: normalizePublicUrl(row.image_url),
        }));

        // Fetch metadata (specs, highlights)
        const metadata = await pool.query(
            'SELECT category, key, value, icon_name, display_order FROM product_metadata WHERE product_id = $1 ORDER BY display_order ASC',
            [product.id]
        );
        product.metadata = metadata.rows.map((row: any) => ({
            ...row,
            icon_name: normalizePublicUrl(row.icon_name),
        }));

        // Fetch FAQs
        const faqs = await pool.query(
            'SELECT question, answer, display_order FROM faqs WHERE product_id = $1 AND is_active = true ORDER BY display_order ASC',
            [product.id]
        );
        product.faqs = faqs.rows;

        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    const { name, slug, description, category_id, is_active } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO products (name, slug, base_description, category_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, slug, description, category_id, is_active]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
