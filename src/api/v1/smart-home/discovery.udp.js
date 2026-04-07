import dgram from 'dgram';
import e from 'express';
import process from 'process';

const BROADCAST_IP = process.env.BROADCAST_IP || '255.255.255.255';
const BROADCAST_PORT = Number(process.env.BROADCAST_PORT || 41234);

class LocalDiscovery {
    constructor() {
        this.setupComplete = false;
        this.udpServer = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.requestId = 0;
        this.activeRequestId = null;
        this.devices = {};

        this.startServer();
        this.listenToBroadcastResponses();
    }

    getDevices() {
        return this.devices;
    }

    listenToBroadcastResponses() {
        this.udpServer.on('message', (msg, rinfo) => {
            let payload;
            try {
                payload = JSON.parse(msg.toString());
            } catch {
                return;
            }

            if (payload?.type !== 'discovery:response') return;
            if (payload?.requestId !== this.activeRequestId) return;
            if (!payload?.deviceId) return;

            this.devices[payload.deviceId] = {
                ...payload,
                ip: payload.ip || rinfo.address,
            };
        });
    }

    startServer() {
        this.udpServer.bind(BROADCAST_PORT, () => {
            this.udpServer.setBroadcast(true);
            this.setupComplete = true;
        });
    }

    discoverDevices(timeoutMs = 400) {
        this.devices = {};
        const requestId = this.requestId++;
        this.activeRequestId = requestId;
        this.sendBroadcastWithIDs(requestId);

        return new Promise(resolve => {
            setTimeout(() => resolve(this.getDevices()), timeoutMs);
        });
    }

    sendBroadcastWithIDs(requestId) {
        const payload = Buffer.from(
            JSON.stringify({
                type: 'discovery',
                requestId,
            })
        );

        this.udpServer.send(payload, 0, payload.length, BROADCAST_PORT, BROADCAST_IP);
    }
}

export const localDiscovery = new LocalDiscovery();

const devices = localDiscovery.getDevices()

console.log(devices)
