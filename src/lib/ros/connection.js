// ros-connection.js
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

const { ROSBRIDGE_HOST = 'localhost', ROSBRIDGE_PORT = '9090' } = process.env;

const ROS_URL = `ws://${ROSBRIDGE_HOST}:${ROSBRIDGE_PORT}`;

class RosConnection {
    constructor() {
        if (RosConnection.instance) {
            return RosConnection.instance;
        }

        this.url = ROS_URL;
        this.ros = null;
        this.connected = false;

        this._connect();

        RosConnection.instance = this;
    }

    _connect() {
        logger.info(`Connecting to rosbridge at ${this.url}...`);
        this.ros = new ROSLIB.Ros({ url: this.url });

        this.ros.on('connection', () => {
            this.connected = true;
            logger.info('Connected to rosbridge');
        });

        this.ros.on('error', err => {
            this.connected = false;
            logger.error(`ROS error: ${err}`);
        });

        this.ros.on('close', () => {
            if (this.connected) {
                logger.warn('Connection to rosbridge closed');
            } else {
                logger.warn('Failed to connect to rosbridge');
            }
            this.connected = false;

            // Retry after delay
            setTimeout(() => this._connect(), 2000);
        });
    }

    isConnected() {
        return this.connected && this.ros.isConnected;
    }

    getRos() {
        if (!this.ros) {
            throw new Error('ROS connection not initialized');
        }
        return this.ros;
    }
}

const rosHandler = new RosConnection();
export default rosHandler;
