import dgram from 'dgram';
import process from 'process';
import fs from 'fs';
import logger from '../../utils/logger.js';

class MockDeviceDiscovery {
    constructor() {
        this.client = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.__config();
        this.__attachResponse();
        this.__startListening();
        this.client.bind(Number(process.env.BROADCAST_PORT || 41234));
    }

    __config() {
        const specs = fs.readFileSync("./src/mocks/smart-home/smart-dev.json");
        this.specs = JSON.parse(specs)
    }

    __startListening() {
        this.client.on('listening', () => {
            const addr = this.client.address();
            logger.info(`start listening for broadcasts on ${addr.address}:${addr.port}`);
        });
    }

    __attachResponse() {
        this.client.on('message', (msg, rinfo) => {
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

            this.client.send(response, 0, response.length, rinfo.port, rinfo.address);
        });
    }
}

export const mockDeviceDiscovery = new MockDeviceDiscovery();
