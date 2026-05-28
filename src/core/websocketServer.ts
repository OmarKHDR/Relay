import { Server, Socket, type Server as SocketIo } from 'socket.io';
import logger from '@/utils/logger.js';
import { createServer, type Server as HttpServer } from 'http';
import { WSCallback } from './types/wsCallback.types.js';

interface extendedSocket extends SocketIo {
    initialized?: boolean;
}
export default class WebsocketServer {
    static instance: WebsocketServer | null;
    httpServer!: HttpServer;
    io!: extendedSocket;
    constructor(httpServer: HttpServer) {
        if (WebsocketServer.instance) {
            return WebsocketServer.instance;
        }
        this.httpServer = httpServer;
        WebsocketServer.instance = this;
    }

    createWS() {
        this.io = new Server(this.httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        return this;
    }

    registerCallback(callbackRegistry: WSCallback[]) {
        if (this.io.initialized) {
            logger.warn('WebSocket server already initialized');
            return this;
        }
        //register broadcast once with the IO instance
        this.registerBroadCallback(callbackRegistry);
        this.io.on('connection', (socket: Socket) => {
            logger.info(`Socket Connected: ${socket.id}`);

            this.registerPubCallback(callbackRegistry, socket);
            this.registerSubCallback(callbackRegistry, socket);

            socket.on('disconnect', reason => {
                logger.info(`Socket Disconnected: ${socket.id}, Reason: ${reason}`);
            });

            socket.on('error', error => {
                logger.error(`Socket Error: ${socket.id}`, error);
            });
        });
        this.io.initialized = true;

        logger.info('WebSocket server initialized');
        return this;
    }


    registerSubCallback(callbackRegistry: WSCallback[], socket: Socket) {
        callbackRegistry.forEach(registry => {
            registry.subscribe.forEach(sub => {
                socket.on(sub.eventName, data => {
                    sub.callback(data);
                });
            });
        });
    }

    // the user (socket) is subscribing to an event name
    registerPubCallback(callbackRegistry: WSCallback[], socket: Socket) {
        callbackRegistry.forEach(registry => {
            registry.publish.forEach(pub => {
                pub.callback(socket, pub.eventName);
            });
        });
    }

    registerBroadCallback(callbackRegistry: WSCallback[]) {
        callbackRegistry.forEach(registry => {
            registry.broadcast.forEach(broad => {
                broad.callback(this.io);
            });
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
