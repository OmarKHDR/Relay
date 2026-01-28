import dotenv from 'dotenv';
import logger from '#utils/logger.js';
import websocketServer, {httpServer} from '#servers/websocketServer.js';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOSTNAME || 'localhost';




// Start the server
httpServer.listen(PORT, HOST, () => {
    logger.info(`HTTP & WS running on http://${HOST}:${PORT}`);
    logger.info(`WebSocket controllers registered: ${websocketServer.callbackRegistry.length}`);
    logger.info(`Active connections: ${websocketServer.getConnectionCount()}`);
});
