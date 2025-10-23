import http from 'http';
import expressApp from '#src/expressServer.js';
import websocketServer from '#src/websocketServer.js';
import WsWheelchairController from '#wsControllers/wsWheelchairController.js';


// Create HTTP server with Express app
const httpServer = http.createServer(expressApp);

// Register all WebSocket controllers
const wheelchairController = new WsWheelchairController(websocketServer);
websocketServer.registerController(wheelchairController)

websocketServer.initialize(httpServer);



export default httpServer;
