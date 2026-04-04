import mqtt from 'mqtt';
import logger from '#utils/logger.js';

let client = null;

export function connectMQTT(brokerUrl, options = {}) {
    if (client) {
        return client;
    }

    client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        logger.info('MQTT connected');
    });

    client.on('close', () => {
        logger.warn('MQTT disconnected');
    });

    client.on('error', err => {
        logger.error(`MQTT error: ${err.message}`);
    });

    return client;
}

export function getMQTTClient() {
    if (!client) {
        throw new Error('MQTT client not initialized');
    }
    return client;
}

