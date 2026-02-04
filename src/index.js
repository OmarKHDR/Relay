import dotenv from 'dotenv';
import logger from '#utils/logger.js';
import Server from '#servers/server.js';
import { swaggerOptions } from '../swagger.options.js';
import { RouterRegistry } from '#servers/routerRegistry.js';
import { CallbackRegistry } from '#servers/callbackRegistry.js';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;
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
    CORS: '*',
});

server.registerModules({
    RouterRegistry,
    CallbackRegistry,
});

server.start({
    host: HOST,
    port: PORT,
});
