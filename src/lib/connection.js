import ROSLIB from 'roslib';
import logger from '../utils/logger.js';

const WebSocketport = process.env.ROSBRIDGE_PORT;
const WebSocketHost = process.env.ROSBRIDGE_HOST;

const ros = new ROSLIB.Ros({
  url: `ws://${WebSocketHost}:${WebSocketport}` || 'ws://localhost:9090'
});

ros.on('connection', () => logger.info('Connected to rosbridge'));
ros.on('error', (err) => logger.error(`ROS error ${err}`));
ros.on('close', () => logger.warn('Connection to rosbridge closed'));

export default ros;
