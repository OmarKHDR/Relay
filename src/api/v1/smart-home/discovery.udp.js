import dgram from 'dgram';
import process from 'process';
import logger from '../../../utils/logger.js';
import 'dotenv/config';

const BROADCAST_IP = process.env.BROADCAST_IP || '255.255.255.255';
const BROADCASTER_PORT = Number(process.env.BROADCASTER_PORT || 9999);
const BROADCAST_SMART_DEVICE_PORT = process.env.BROADCAST_SMART_DEVICE_PORT || 9988;

class LocalDiscovery {
    constructor() {
        this.udpSender = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.requestId = 0;
        this.activeRequestId;
        this.devices = {};
        this.startServer();
        this.listenToBroadcastResponses(this.udpSender);
    }

    async getDevices() {
        await this.discoverDevices();
        return this.devices;
    }

    listenToBroadcastResponses(socketObj) {
        socketObj.on('message', (msg, rinfo) => {
            let payload;
            try {
                payload = JSON.parse(msg.toString());
            } catch {
                return;
            }
            logger.info(`[SERVER-DISCOVERY] recieved a response`);
            console.log(payload);
            if (payload?.type !== 'discovery:response') return;
            logger.info(`[SERVER-DISCOVERY] PASSING type check`);
            if (payload?.requestId !== this.activeRequestId) return;
            logger.info(`[SERVER-DISCOVERY] PASSING Request id check`);
            if (!payload?.deviceId) return;
            logger.info(`[SERVER-DISCOVERY] PASSING deviceId check`);
            this.devices[payload.deviceId] = {
                ...payload,
                ip: payload.ip || rinfo.address,
            };
        });
    }

    startServer() {
        this.udpSender.bind(BROADCASTER_PORT, () => {
            this.udpSender.setBroadcast(true);
        });
    }

    discoverDevices(timeoutMs = 4000) {
        this.devices = {};
        const requestId = this.requestId++;
        this.activeRequestId = requestId;
        this.sendBroadcastWithIDs(requestId);

        return new Promise(resolve => {
            setTimeout(() => resolve({ ...this.devices }), timeoutMs);
        });
    }

    sendBroadcastWithIDs(requestId) {
        const payload = Buffer.from(
            JSON.stringify({
                type: 'discovery',
                port: BROADCASTER_PORT,
                requestId,
            })
        );
        console.log(`sending broadcasts through: ${BROADCAST_SMART_DEVICE_PORT}, ${BROADCAST_IP}`);
        this.udpSender.send(payload, 0, payload.length, BROADCAST_SMART_DEVICE_PORT, BROADCAST_IP);
    }
}

export const localDiscovery = new LocalDiscovery();
const devices = localDiscovery.getDevices().then(res => console.log(res));
