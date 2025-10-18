import logger from '#utils/logger.js';
import apiRouter from '#routes';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

class ExpressServer {
    constructor() {
        if (ExpressServer.instance) {
            return ExpressServer.instance;
        }

        this.server = express();

        // Mark instance early to avoid accidental re-init
        ExpressServer.instance = this;

        this.initializeCoreMiddleware();
        this.attachLogger();
        this.mountRoutes();
    }

    initializeCoreMiddleware() {
        this.server.use(cors());
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: true }));
    }

    attachLogger() {
        this.server.use(
            morgan(':method :url :status :response-time ms', {
                stream: {
                    write: message => logger.info(message.trim()),
                },
            })
        );
    }

    mountRoutes() {
        this.server.use('/api/v1', apiRouter);
    }

    getServer() {
        return this.server;
    }
}

const serverCreator = new ExpressServer();
const app = serverCreator.getServer();
export default app;
