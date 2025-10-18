import { Server } from 'socket.io';

class WebsocketServer {
    constructor(httpServer) {
        if (WebsocketServer.instance) return WebsocketServer.instance;

        this.io = new Server(httpServer, {
            cors: '*'
        });

        this.io.on('connection', socket => {
            console.log(`Socket Connected: ${socket.id}`);

            socket.on('message', data => {
                console.log('Received message:', data);
            });

            socket.on('disconnect', () => {
                console.log(`Socket Disconnected: ${socket.id}`);
            });
        });

        WebsocketServer.instance = this;
    }

    getIO() {
        return this.io;
    }
}

export default WebsocketServer;
