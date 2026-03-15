import type { Request } from 'express';
export type UserRole = 'customer' | 'admin';

export interface User {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    mobile_number?: string;
    password?: string;
    role: UserRole;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
    };
}
