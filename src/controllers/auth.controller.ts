import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const signup = async (req: Request, res: Response) => {
    const { first_name, last_name, email, mobile_number, otp, terms_accepted, whatsapp_opt_in } = req.body;

    try {
        // Default OTP for development: 1234
        if (otp !== '1234') {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const userExists = await pool.query('SELECT * FROM profiles WHERE phone = $1', [mobile_number]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists, please login' });
        }

        const full_name = `${first_name} ${last_name}`.trim();

        const newUser = await pool.query(
            'INSERT INTO profiles (full_name, email, phone, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, phone, role',
            [full_name, email?.trim().toLowerCase() || null, mobile_number, 'customer']
        );

        const user = newUser.rows[0];

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

        const token = jwt.sign(
            { id: user.id, role: 'customer' },
            jwtSecret,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.status(201).json({
            token,
            user: {
                ...user,
                first_name,
                last_name,
                email: user.email || '',
                mobile_number: user.phone,
                role: user.role || 'customer',
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { mobile_number, otp } = req.body;

    try {
        if (otp !== '1234') {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const userResult = await pool.query('SELECT * FROM profiles WHERE phone = $1', [mobile_number]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found, please signup' });
        }

        const user = userResult.rows[0];
        const [first_name, ...last_parts] = (user.full_name || '').split(' ');
        const last_name = last_parts.join(' ');

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

        const token = jwt.sign(
            { id: user.id, role: user.role || 'customer' },
            jwtSecret,
            { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                first_name,
                last_name,
                email: user.email || '',
                mobile_number: user.phone,
                role: user.role || 'customer',
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const checkPhone = async (req: Request, res: Response) => {
    const { mobile_number } = req.body;

    if (!mobile_number || String(mobile_number).length !== 10) {
        return res.status(400).json({ message: 'Invalid mobile number' });
    }

    try {
        const result = await pool.query(
            'SELECT id FROM profiles WHERE phone = $1',
            [mobile_number]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No account found with this number. Please sign up first.' });
        }

        return res.status(200).json({ exists: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const userResult = await pool.query(
            'SELECT id, full_name, email, phone, role, created_at FROM profiles WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        const [first_name, ...last_parts] = (user.full_name || '').split(' ');
        const last_name = last_parts.join(' ');

        res.json({
            ...user,
            first_name,
            last_name,
            email: user.email || '',
            mobile_number: user.phone,
            role: user.role || 'customer',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
