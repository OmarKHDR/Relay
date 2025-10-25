import dotenv from 'dotenv';
import logger from '#utils/logger.js';
import httpServer from '#src/wsInit.js';
import websocketServer from '#src/websocketServer.js';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOSTNAME || 'localhost';




// Start the server
httpServer.listen(PORT, HOST, () => {
    logger.info(`HTTP & WS running on http://${HOST}:${PORT}`);
    logger.info(`WebSocket controllers registered: ${websocketServer.controllers.length}`);
    logger.info(`Active connections: ${websocketServer.getConnectionCount()}`);
});
