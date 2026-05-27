import z from 'zod';

export interface ZodGeneralSchema {
    body?: z.ZodObject;
    params?: z.ZodObject;
    query?: z.ZodObject;
}
