import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // Also support Bearer token from Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        const bearer = req.headers.authorization.split(' ')[1];
        // Only accept if it's not the mock token
        if (bearer && bearer !== 'cookie-auth') {
            token = bearer;
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
};
