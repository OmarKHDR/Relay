import { Server } from 'socket.io';
import logger from '#utils/logger.js';

export default class WebsocketServer {
constructor(httpServer) {
    if (WebsocketServer.instance) {
        return WebsocketServer.instance;
    }
    this.io = null;
    this.httpServer = httpServer;
    WebsocketServer.instance = this;
}

reset() {
    WebsocketServer.instance = null;
}

createWS(options = {}) {
    this.io = new Server(this.httpServer, {
        cors: {
            origin: options.cors || '*',
            methods: ['GET', 'POST'],
        },
    });
    return this
}

registerCallback(callbackRegistry) {
    if (this.io.initialized) {
        logger.warn('WebSocket server already initialized');
        return this;
    }
    //register broadcast once with the IO instance
    this.registerBroadCallback(callbackRegistry);
    this.io.on('connection', socket => {
        logger.info(`Socket Connected: ${socket.id}`);
        
        this.registerPubCallback(callbackRegistry, socket);
        this.registerSubCallback(callbackRegistry, socket);

        socket.on('disconnect', reason => {
            logger.info(`Socket Disconnected: ${socket.id}, Reason: ${reason}`);
            this.cleanSockets(callbackRegistry, socket);
        });
        
        socket.on('error', error => {
            logger.error(`Socket Error: ${socket.id}`, error);
        });
    });
    this.io.initialized = true;

    logger.info('WebSocket server initialized');
    return this;
}

//the user published data
registerPubCallback(callbackRegistry, socket) {
    callbackRegistry.forEach(registry => {
        registry.publish.forEach(pub => {
            socket.on(pub.eventName, data => {
                pub.callback(data);
            });
        });
    });
}

// the user (socket) is subscribing to an event name
registerSubCallback(callbackRegistry, socket) {
    callbackRegistry.forEach(registry => {
        registry.subscribe.forEach(sub => {
            sub.callback(socket, sub.eventName, this.io);
        });
    });
}

registerBroadCallback(callbackRegistry) {
    callbackRegistry.forEach(registry => {
        registry.broadcast.forEach(broad => {
            broad.callback(this.io, broad.eventName);
        });
    });
}

cleanSockets(callbackRegistry, socket) {
    callbackRegistry.forEach(registry => {
        registry.cleanup(socket);
    });
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
