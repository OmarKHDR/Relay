import dotenv from 'dotenv';
import http from 'http';
import expressApp from '#src/expressServer.js';
import websocketServer from '#src/websocketServer.js';
import WsWheelchairController from '#wsControllers/wsWheelchairController.js';
import logger from '#utils/logger.js';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOSTNAME || 'localhost';

// Create HTTP server with Express app
const httpServer = http.createServer(expressApp);



// Register all WebSocket controllers
const wheelchairController = new WsWheelchairController(websocketServer);

websocketServer.registerController(wheelchairController)


websocketServer.initialize(httpServer);

// Store controller references if needed for external access
global.controllers = {
    wheelchair: wheelchairController,

};

// Start the server
httpServer.listen(PORT, HOST, () => {
    logger.info(`HTTP & WS running on http://${HOST}:${PORT}`);
    logger.info(`WebSocket controllers registered: ${websocketServer.controllers.length}`);
    logger.info(`Active connections: ${websocketServer.getConnectionCount()}`);
});