import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class UltrasonicSensor {
    constructor() {
        if (UltrasonicSensor.instance) {
            return UltrasonicSensor.instance;
        }

        logger.info('[UltrasonicSensor] Initializing UltrasonicSensor topic handler');

        this.ros = rosHandler.getRos();
        this.distance = undefined;
        this.topic = this.createTopic();
        this.subscribe();

        UltrasonicSensor.instance = this;
    }

    createTopic() {
        const topic = new ROSLIB.Topic({
            ros: this.ros,
            name: '/ultrasonic',
            messageType: 'std_msgs/Float32',
        });
        logger.info('[UltrasonicSensor] Topic created: /ultrasonic (std_msgs/Float32)');
        return topic;
    }

    subscribe() {
        const startSubscription = () => {
            this.topic.subscribe(msg => {
                this.distance = msg.data;
                logger.info(`[UltrasonicSensor] Received distance value: ${msg.data}`);
            });
            logger.info('[UltrasonicSensor] Subscribed to /ultrasonic');
        };

        if (this.ros.isConnected) {
            startSubscription();
        } else {
            logger.warn('[UltrasonicSensor] ROS not connected — waiting for connection to subscribe');
            this.ros.on('connection', () => {
                logger.info('[UltrasonicSensor] ROS connected — subscribing now');
                startSubscription();
            });
        }
    }


    getDistance() {
        if (this.distance !== undefined) {
            logger.info(`[UltrasonicSensor] Returning distance value: ${this.distance}`);
            return this.distance;
        } else {
            logger.warn('[UltrasonicSensor] Distance value is undefined');
            return undefined;
        }
    }
}

const ultrasonicSensorHandler = new UltrasonicSensor();
export default ultrasonicSensorHandler;
