import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const getBatchReport = async (req: any, res: Response) => {
    const { product_id, batch_number } = req.query;

    try {
        let batchResult;
        if (product_id) {
            batchResult = await pool.query(
                `SELECT rb.*, p.name as "productName" 
                 FROM report_batches rb 
                 JOIN products p ON rb.product_id = p.id 
                 WHERE rb.product_id = $1 AND rb.batch_number = $2`,
                [product_id, batch_number]
            );
        } else {
            batchResult = await pool.query(
                `SELECT rb.*, p.name as "productName" 
                 FROM report_batches rb 
                 JOIN products p ON rb.product_id = p.id 
                 WHERE rb.batch_number = $1`,
                [batch_number]
            );
        }

        if (batchResult.rows.length === 0) {
            return res.status(404).json({ message: 'Batch report not found' });
        }

        const batch = batchResult.rows[0];

        const resultsResult = await pool.query(
            `SELECT test_name as name, test_value as result, unit, pass_status as status 
             FROM report_test_results 
             WHERE batch_id = $1 
             ORDER BY created_at ASC`,
            [batch.id]
        );

        // Convert boolean status to string 'passed'/'failed'
        const tests = resultsResult.rows.map(t => ({
            ...t,
            status: t.status ? 'passed' : 'failed'
        }));

        res.json({
            batchNumber: batch.batch_number,
            productName: batch.productName,
            testDate: batch.testing_date,
            labName: batch.tested_by || 'WellForged Lab',
            status: tests.every(t => t.status === 'passed') ? 'passed' : 'failed',
            tests: tests
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getInventoryLogs = async (req: Request, res: Response) => {
    const { sku_id } = req.params;

    try {
        // Return SKU details with stock level as a simple inventory snapshot
        const result = await pool.query(
            `SELECT s.id, s.label, s.stock, s.price, p.name as product_name, s.created_at
             FROM skus s
             JOIN products p ON s.product_id = p.id
             WHERE s.id = $1`,
            [sku_id]
        );
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createBatchReport = async (req: Request, res: Response) => {
    const { product_id, batch_number, testing_date, tested_by, test_results } = req.body;

    if (!Array.isArray(test_results)) {
        return res.status(400).json({ message: 'test_results must be an array' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const batchResult = await client.query(
            `INSERT INTO report_batches (product_id, batch_number, testing_date, tested_by) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [product_id, batch_number, testing_date, tested_by]
        );
        const batch = batchResult.rows[0];

        for (const test of test_results) {
            await client.query(
                `INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [batch.id, test.test_name, test.test_value, test.unit, test.pass_status ?? true]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(batch);
    } catch (error: any) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
};
