import dotenv from 'dotenv';
import logger from '#utils/logger.js';
import Server from '#servers/server.js';
import { swaggerOptions } from '../swagger.options.js';
import { RouterRegistry } from '#servers/routerRegistry.js';
import { CallbackRegistry } from '#servers/callbackRegistry.js';

dotenv.config();

const PORT = process.env.SERVER_PORT || 5051;
const HOST = process.env.SERVER_HOSTNAME || 'localhost';

const server = new Server();

server.configureExpress({
    logging: logger,
    docs: {
        swaggerOptions,
        prefix: '/api/v1',
        endpoint: '/docs',
    },
});

server.configureWS({
    cors: '*',
});

server.registerModules({
    routes: {
        RouterRegistry,
        prefix: "/api/v1",
    },
    callback: CallbackRegistry,
});

server.initializeDb().then(_ => {
        server.start({
            host: HOST,
            port: PORT,
        });
    }
);
