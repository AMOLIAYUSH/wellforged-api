import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';
import { AppError } from './error.middleware.js';

export const validate = (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            const message = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new AppError(message, 400));
        }
        return next(error);
    }
};
