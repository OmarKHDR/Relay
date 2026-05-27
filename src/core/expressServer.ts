import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { dataValidation } from '#src/middleware/validation.middleware.js';
import { globalControllerWrapper } from '#utils/controller.wrapper.js';
import { errorHandler } from '#src/middleware/global.error.handler.middleware.js';
import winston from 'winston';
import { Routes } from './types/Routes.types';
import { rosExcuter } from './rosExecuter';
import { rosInjector } from '#src/middleware/rosInjector.middleware.ts';
import logger from '#utils/logger.js';

export default class ExpressServer {
    static instance: ExpressServer;
    app?: Express;
    swaggerDocs?: Object;

    constructor(app: Express) {
        if (ExpressServer.instance) {
            return ExpressServer.instance;
        }

        this.app = app;
        ExpressServer.instance = this;
    }

    initializeCoreMiddleware() {
        this.app?.use(cors());
        this.app?.use(express.json());
        this.app?.use(express.urlencoded({ extended: true }));
        return this;
    }

    attachLogger(logger: winston.Logger) {
        if (logger)
            this.app?.use(
                morgan(':method :url :status :response-time ms', {
                    stream: {
                        write: message => logger.info(message.trim()),
                    },
                })
            );
        return this;
    }

    mountRoutesAndMiddlewares(routerRegistry: Routes[], prefix = '/api/v1') {
        for (const routerConfig of routerRegistry) {
            this.attachRoutes(routerConfig, prefix);
            this.attachMiddlewares(routerConfig);
        }
        this.app?.use(errorHandler);
        return this;
    }

    attachRoutes(routerConfig: Routes, prefix = '/api/v1') {
        const routes = routerConfig.routes;
        const base = routerConfig.base || '';
        for (const route of routes) {
            const path = prefix + base + (route.path ?? '');
            const handlers = [];
            if (route.dto) {
                handlers.push(dataValidation(route.dto));
            }
            handlers.push(globalControllerWrapper(route.controller));
            console.log('initializing: ', route.method, routerConfig.base + route.path);

            switch (route.method?.toUpperCase()) {
                case 'GET':
                    this.app?.get(path, ...handlers);
                    break;
                case 'POST':
                    this.app?.post(path, ...handlers);
                    break;
                case 'PUT':
                    this.app?.put(path, ...handlers);
                    break;
                case 'PATCH':
                    this.app?.patch(path, ...handlers);
                    break;
                case 'DELETE':
                    this.app?.delete(path, ...handlers);
                    break;
                default:
                    console.warn(
                        `Unsupported HTTP method: ${route.method} for path ${path}, skepping`
                    );
                    break;
            }
            if (route.ROS) {
                logger.info(`[EXPRESS SERVER] mouting ros object to the route: ${path}`)
                const ros = rosExcuter.build(route.ROS);
                this.app?.use(path, rosInjector);
            }
        }
    }

    attachMiddlewares(routerConfig: Routes, prefix = '/api/v1') {
        const routes = routerConfig.routes || routerConfig;
        const base = routerConfig.base || '';

        for (const route of routes) {
            const path = prefix + base + (route.path ?? '');
            if (route.middlewares)
                for (const middleware of route.middlewares) this.app?.use(path, middleware);
        }
    }

    setUpSwaggerDocs(options: swaggerJsdoc.Options, prefix = '/api/v1', endpoint = '/docs') {
        this.swaggerDocs = swaggerJsdoc(options);
        if (this.swaggerDocs) {
            this.app?.use(
                prefix + endpoint,
                swaggerUiExpress.serve,
                swaggerUiExpress.setup(this.swaggerDocs)
            );
            this.app?.get(prefix + endpoint + '.json', (req, res) => res.json(this.swaggerDocs));
        } else throw new Error('cant setup swagger');
        return this;
    }

    getApp() {
        return this.app;
    }
}
