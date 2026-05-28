import timestamper from '@/utils/timestamp.js';
import {NextFunction, Request, Response } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = 500;
    res.status(statusCode).json({
        success: false,
        reason: err.message || 'internal server error',
        meta: { timestamp: timestamper() },
    });
};
