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

        this.app = express();
        ExpressServer.instance = this;

        this.initializeCoreMiddleware();
        this.attachLogger();
        this.mountRoutes();
    }

    initializeCoreMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    attachLogger() {
        this.app.use(
            morgan(':method :url :status :response-time ms', {
                stream: {
                    write: message => logger.info(message.trim()),
                },
            })
        );
    }

    mountRoutes() {
        this.app.use('/api/v1', apiRouter);
    }

    getApp() {
        return this.app;
    }
}

const expressServer = new ExpressServer();
export default expressServer.getApp();