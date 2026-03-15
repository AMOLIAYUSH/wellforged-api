import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '../types/index.js';

interface JwtPayload {
    id: string;
    role: UserRole;
}

export const authenticate = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ message: 'Internal server configuration error' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const optionalAuthenticate = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
        try {
            const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
            req.user = decoded;
        } catch (error: any) {
            console.log('Optional authentication failed:', error.message);
        }
    }
    next();
};

export const authorize = (roles: UserRole[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};
