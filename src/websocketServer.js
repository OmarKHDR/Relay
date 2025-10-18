import { Server } from 'socket.io';
import logger from '#utils/logger.js';

class WebsocketServer {
    constructor() {
        if (WebsocketServer.instance) {
            return WebsocketServer.instance;
        }

        this.io = null;
        this.controllers = [];
        this.middlewares = [];
        WebsocketServer.instance = this;
    }

    initialize(httpServer, options = {}) {
        if (this.io) {
            logger.warn('WebSocket server already initialized');
            return this;
        }

        this.io = new Server(httpServer, {
            cors: {
                origin: options.cors || '*',
                methods: ['GET', 'POST']
            },
            ...options
        });

        // Apply global middlewares if exist
        this.middlewares.forEach(middleware => {
            this.io.use(middleware);
        });

        // Handle connections
        this.io.on('connection', socket => {
            logger.info(`Socket Connected: ${socket.id}`);

            // Initialize all registered controllers for this socket
            this.controllers.forEach(controller => {
                controller.onConnection(socket);
            });

            socket.on('disconnect', reason => {
                logger.info(`Socket Disconnected: ${socket.id}, Reason: ${reason}`);
                
                // Cleanup for all controllers
                this.controllers.forEach(controller => {
                    if (controller.onDisconnect) {
                        controller.onDisconnect(socket);
                    }
                });
            });

            socket.on('error', error => {
                logger.error(`Socket Error: ${socket.id}`, error);
            });
        });

        logger.info('WebSocket server initialized');
        return this;
    }

    // Register a controller that will handle events
    registerController(controller) {
        if (!controller.onConnection || typeof controller.onConnection !== 'function') {
            throw new Error('Controller must implement onConnection(socket) method');
        }

        this.controllers.push(controller);
        logger.info(`Controller registered: ${controller.constructor.name}`);
        return this;
    }

    // Add global middleware (must be called before initialize)
    use(middleware) {
        if (this.io) {
            logger.warn('Middleware should be added before initialization');
            this.io.use(middleware);
        } else {
            this.middlewares.push(middleware);
        }
        return this;
    }

    // Broadcast to all connected clients
    broadcast(event, data) {
        if (!this.io) {
            throw new Error('WebSocket server not initialized');
        }
        this.io.emit(event, data);
        return this;
    }

    // Broadcast to a specific room
    broadcastToRoom(room, event, data) {
        if (!this.io) {
            throw new Error('WebSocket server not initialized');
        }
        this.io.to(room).emit(event, data);
        return this;
    }

    getIO() {
        if (!this.io) {
            throw new Error('WebSocket server not initialized. Call initialize() first.');
        }
        return this.io;
    }

    // Get number of connected clients
    getConnectionCount() {
        return this.io?.sockets.sockets.size || 0;
    }
}

const websocketServer = new WebsocketServer();
export default websocketServer;
