import z from 'zod';
import type { ROS } from './Ros.types';
import { ZodGeneralSchema } from './zod.types';
import { RequestHandler } from 'express';

export interface Routes {
    base: string;
    routes: Route[];
}

export interface Route {
    name: string;
    description: string;
    method: HTTPMethod;
    path: string;
    dto?: ZodGeneralSchema;
    controller: Function;
    middlewares?: Array<RequestHandler>;
    ROS?: ROS;
}

export const HTTPMethod = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
    OPTIONS: 'OPTIONS',
    HEAD: 'HEAD',
    TRACE: 'TRACE',
    CONNECT: 'CONNECT',
} as const;

export type HTTPMethod = typeof HTTPMethod[keyof typeof HTTPMethod];
