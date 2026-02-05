import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';


export default class ExpressServer {
    constructor(app) {
        if (ExpressServer.instance) {
            return ExpressServer.instance;
        }

        this.app = app;
        ExpressServer.instance = this;
    }

    reset() {
        ExpressServer.instance = null;
    }

    initializeCoreMiddleware(options) {
        this.app.use(options.cors || cors());
        this.app.use(options.json || express.json());
        this.app.use(options.urlencoded || express.urlencoded({ extended: true }));
        return this;
    }

    attachLogger(logger) {
        if (logger)
            this.app.use(
                morgan(':method :url :status :response-time ms', {
                    stream: {
                        write: message => logger.info(message.trim()),
                    },
                })
            );
        return this;
    }

    mountRoutes(RouterRegistry, prefix = '/api/v1') {
        RouterRegistry.forEach(route => {
            this.app.use(prefix, route);
        });
        return this;
    }

    setUpSwaggerDocs(options, prefix="/api/v1", endpoint="/docs") {
        this.swaggerDocs = swaggerJsdoc(options);
        if(this.swaggerDocs)
            this.app.use(prefix+endpoint, swaggerUiExpress.serve, swaggerUiExpress.setup(this.swaggerDocs));
        else throw new Error('cant setup swagger')
        return this;
    } 

    getApp() {
        return this.app;
    }
}