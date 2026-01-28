import { Server } from 'socket.io';
import logger from '#utils/logger.js';
import { CallbackRegistry } from '#servers/callbackRegistry.js';
import expressApp from '#servers/expressServer.js'
import http from 'http';




class WebsocketServer {
    constructor() {
        if (WebsocketServer.instance) {
            return WebsocketServer.instance;
        }
        this.io = null;
        this.httpServer = http.createServer(expressApp);
        this.callbackRegistry = CallbackRegistry;
        this.initialize();
        WebsocketServer.instance = this;
    }

    initialize(options = {}) {
        if (this.io) {
            logger.warn('WebSocket server already initialized');
            return this;
        }

        this.io = new Server(this.httpServer, {
            cors: {
                origin: options.cors || '*',
                methods: ['GET', 'POST']
            },
            ...options
        });

        // Handle connections
        this.registerBroadCallback();
        this.io.on('connection', socket => {
            logger.info(`Socket Connected: ${socket.id}`);

            this.registerPubCallback(socket);
            this.registerSubCallback(socket);

            socket.on('disconnect', reason => {
                logger.info(`Socket Disconnected: ${socket.id}, Reason: ${reason}`);
                this.cleanSockets(socket);
            });

            socket.on('error', error => {
                logger.error(`Socket Error: ${socket.id}`, error);
            });
        });

        logger.info('WebSocket server initialized');
        return this;
    }

    //if anyone publish on an event the callback is triggered
    registerPubCallback(socket) {
        this.callbackRegistry.forEach(registry => {
            registry.publish.forEach(pub => {
                socket.on(pub.eventName, data => {
                    pub.callback(data)
                })
            })
        })
    }

    //if anyone publish on an event the callback is triggered
    registerPubCallback(socket) {
        this.callbackRegistry.forEach(registry => {
            registry.publish.forEach(pub => {
                socket.on(pub.eventName, data => {
                    pub.callback(data)
                })
            })
        })
    }

    registerSubCallback(socket) {
        this.callbackRegistry.forEach(registry => {
            registry.subscribe.forEach(sub => {
                sub.callback(socket, sub.eventName)
            })
        })
    }

    registerBroadCallback() {
        this.callbackRegistry.forEach(registry => {
            registry.broadcast.forEach(broad => {
                broad.callback(this.io, broad.eventName)
            })
        })
    }

    cleanSockets(socket) {
        this.callbackRegistry.forEach(registry => {
            registry.cleanup(socket)
        })
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
export const httpServer = websocketServer.httpServer;
export default websocketServer;
