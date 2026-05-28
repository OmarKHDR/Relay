import { rosStateManager } from '@/core/rosStateManager.js';
import type { NextFunction, Request, Response } from 'express';

export function rosInjector(key: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.ros = rosStateManager.get(key);
            next();
        } catch (error) {
            next(error);
        }
    };
}
