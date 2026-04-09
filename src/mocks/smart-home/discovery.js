import dgram from 'dgram';
import process from 'process';
import fs from 'fs';
import logger from '../../utils/logger.js';

const PORT = process.env.BROADCAST_SMART_DEVICE_PORT || 9988;
class MockDeviceDiscovery {
    constructor() {
        this.client = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.__config();
        this.__startListening();
        this.__attachResponseCallback();
        this.client.bind(PORT, () => {
            this.client.setBroadcast(true);
        });
    }

    __config() {
        const specs = fs.readFileSync('./src/mocks/smart-home/smart-dev.json');
        this.specs = JSON.parse(specs);
    }

    __startListening() {
        this.client.on('listening', () => {
            const addr = this.client.address();
            logger.info(`start listening for broadcasts on ${addr.address}:${addr.port}`);
        });
    }

    __attachResponseCallback() {
        this.client.on('message', (msg, rinfo) => {
            logger.info(
                `[MOCK-DEVICE-DISCOVERY] recieved a message from: ${rinfo.address}:${rinfo.port} ${msg.toString()}`
            );
            let payload;
            try {
                payload = JSON.parse(msg.toString());
            } catch {
                return;
            }

            if (payload?.type !== 'discovery') return;

            const response = Buffer.from(
                JSON.stringify({
                    type: 'discovery:response',
                    requestId: payload.requestId,
                    ...this.specs,
                })
            );

            this.client.send(response, 0, response.length, payload.port, rinfo.address);
        });
    }
}

export const mockDeviceDiscovery = new MockDeviceDiscovery();
