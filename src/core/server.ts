import ExpressServer from '@/core/expressServer.js';
import WebsocketServer from '@/core/websocketServer.js';
import logger from '@/utils/logger.js';
import { createServer, type Server as HttpServer } from 'http';
import express from 'express';
import type { Express } from 'express';
import { DataSource } from 'typeorm';
import type { Routes } from './types/Routes.types.js';
import type { WSCallback } from './types/wsCallback.types.js';
import type { ExpressOptions } from './types/server.types.js';

export default class Server {
    static instance: Server | null = null;
    app!: Express;
    httpServer!: HttpServer;
    expressServer!: ExpressServer;
    websocketServer!: WebsocketServer;

    constructor() {
        if (Server.instance) return Server.instance;
        this.app = express();
        this.httpServer = createServer(this.app);

        this.expressServer = new ExpressServer(this.app);
        this.websocketServer = new WebsocketServer(this.httpServer);
        Server.instance = this;
    }

    async initializeModules(inits: Function[]) {
        for (const init of inits) {
            if (typeof init === 'function') {
                await init();
            }
        }
    }

    async initializeDb(AppDataSource: DataSource) {
        await AppDataSource.initialize();
    }

    async initialize(AppDataSource: DataSource, inits: Function[]) {
        await this.initializeDb(AppDataSource);
        await this.initializeModules(inits);
    }

    configureExpress(options: ExpressOptions) {
        this.expressServer
            .initializeCoreMiddleware()
            .attachLogger(options.logger)
            .setUpSwaggerDocs(
                options.docs.swaggerOptions,
                options.docs.prefix,
                options.docs.endpoint
            );
    }

    configureWS() {
        this.websocketServer.createWS();
    }

    registerModules(routerRegistry: Routes[], prefix: string, CallbackRegistry: WSCallback[]) {
        this.expressServer.mountRoutesAndMiddlewares(routerRegistry, prefix);
        this.websocketServer.registerCallback(CallbackRegistry);
    }

    start(port: number, host: string) {
        this.httpServer.listen(port, host, () => {
            logger.info(`HTTP & WS running on http://${host}:${port}`);
            logger.info(`Active connections: ${this.websocketServer.getConnectionCount()}`);
        });
    }
}
