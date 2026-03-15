import { z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address').optional(),
        mobile_number: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
        otp: z.string().min(4, 'OTP must be at least 4 digits'),
        terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
        whatsapp_opt_in: z.boolean().optional()
    })
});

export const loginSchema = z.object({
    body: z.object({
        mobile_number: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
        otp: z.string().min(4, 'OTP must be at least 4 digits')
    })
});

export const createOrderSchema = z.object({
    body: z.object({
        address_id: z.union([z.number().int(), z.string()]).optional(),
        coupon_id: z.union([z.number().int(), z.string()]).optional().nullable(),
        idempotency_key: z.string().min(1, 'Idempotency key is required'),
        guest_details: z.object({
            full_name: z.string().min(1),
            mobile_number: z.string().min(10),
            address_line1: z.string().min(1),
            city: z.string().min(1),
            state: z.string().min(1),
            pincode: z.string().min(1)
        }).optional(),
        items: z.array(z.object({
            sku_id: z.union([z.number().int(), z.string()]),
            quantity: z.number().int().positive()
        })).optional()
    })
});
