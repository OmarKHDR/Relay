import dotenv from 'dotenv';
import logger from '@/utils/logger.js';
import Server from '@/core/server.js';
import { swaggerOptions } from '../swagger.options.js';
import { RouterRegistry, initialization, CallbackRegistry } from '@/core/registry.js';
import { AppDataSource } from './db/datasources.js';

dotenv.config();

const PORT = Number(process.env.SERVER_PORT) || 5051;
const HOST = process.env.SERVER_HOSTNAME || 'localhost';

const server = new Server();

server.configureExpress({
    logger: logger,
    docs: {
        swaggerOptions,
        prefix: '/api/v1',
        endpoint: '/docs',
    },
});

server.configureWS();

server.registerModules(RouterRegistry, '/api/v1', CallbackRegistry);

server.initialize(AppDataSource, initialization).then(_ => {
    server.start(PORT, HOST);
});
