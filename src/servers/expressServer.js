import logger from '#utils/logger.js';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { swaggerOptions } from '../../swagger.options.js';
import { ApiRegistry } from '#servers/apiRegistry.js';


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
        this.setUpSwaggerDocs(swaggerOptions);
        this.serveSwaggerDocs();
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

    mountRoutes(prefix = '/api/v1') {
        ApiRegistry.forEach(route => {
            this.app.use(prefix, route);
        });
    }

    setUpSwaggerDocs(options) {
        this.swaggerDocs = swaggerJsdoc(options);
    }

    serveSwaggerDocs(prefix="/api/v1", endpoint="/docs") {
        if(this.swaggerDocs)
            this.app.use(prefix+endpoint, swaggerUiExpress.serve, swaggerUiExpress.setup(this.swaggerDocs));
        else throw new Error('cant setup swagger')
    }

    getApp() {
        return this.app;
    }
}

const expressServer = new ExpressServer();
export default expressServer.getApp();
