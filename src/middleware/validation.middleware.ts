import { z, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';
import type { ZodGeneralSchema } from '@/core/types/zod.types.js';

export function dataValidation(SchemaObject: ZodGeneralSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body);
            if (SchemaObject.body) SchemaObject.body.parse(req.body);
            if (SchemaObject.params) SchemaObject.params.parse(req.params);
            if (SchemaObject.query) SchemaObject.query.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues.map(issue => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }));
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'Invalid data',
                    details: message,
                });
            }
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: 'Internal Server Error' });
        }
    };
}
