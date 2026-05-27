import swaggerJSDoc from 'swagger-jsdoc';
import winston from 'winston';

export type ExpressOptions = {
    logger: winston.Logger;
    docs: {
        swaggerOptions: swaggerJSDoc.Options;
        prefix: string;
        endpoint: string;
    };
};
