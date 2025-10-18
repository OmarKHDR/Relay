import http from 'http';
import dotenv from 'dotenv';
import app from './expressServer.js';
import WebsocketServer from './websocketServer.js';

dotenv.config();

const server = http.createServer(app);
const io = new WebsocketServer(server).getIO();

const PORT = process.env.SERVER_PORT;
const HOST = process.env.SERVER_HOSTNAME;

server.listen(PORT, HOST, () => {
    console.log(`HTTP & WS running on http://${HOST}:${PORT}`);
});
