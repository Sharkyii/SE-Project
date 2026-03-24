import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    console.error(err.message, err.stack);

    res.status(statusCode).json({
        message: err.message,
        stack: env.NODE_ENV === 'production' ? null : err.stack,
    });
};
