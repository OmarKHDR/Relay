import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
import EventEmitter from 'events';

class WheelChair extends EventEmitter {
    constructor() {
        if (WheelChair.instance) return WheelChair.instance;
        super();
        logger.info('[WheelChair ROS TOPIC] initializing wheelchair topic');
        this.initParams();
        rosHandler.on('ros_reconnected', (newRosInstance) => {
            logger.info('[WheelChair ROS TOPIC] ROS reconnected, creating new topic...');
            this.ros = newRosInstance;
            this.topic = this.createTopic();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.topic = this.createTopic();
        }
        WheelChair.instance = this;
    }

    initParams() {
        this.MAX_LINEAR = 1.0;
        this.MAX_ANGULAR = 2.0;
        this.linearInput = 0;
        this.angularInput = 0;
    }

    createTopic() {
        logger.info('[WheelChair ROS TOPIC] creating wheelchair topic for controlling speed and angle');
        return new ROSLIB.Topic({
            ros: this.ros,
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist',
        });
    }

    setVelocity(linearInput, angularInput) {
        logger.info(
            `[WheelChair ROS TOPIC] setting velocity with ratio linear speed ${linearInput} and angular speed ${angularInput}`
        );
        const newLinearInput = Math.max(-1, Math.min(1, linearInput));
        const newAngularInput = Math.max(-1, Math.min(1, angularInput));
        const changed = this.linearInput !== newLinearInput || this.angularInput !== newAngularInput;
        if (!changed) {
            logger.info(
            `[WheelChair ROS TOPIC] velocity not changed, keeping it on: ${this.linearInput} and angular speed ${this.angularInput}`
        );
            return;
        }
        this.linearInput = newLinearInput;
        this.angularInput = newAngularInput;
        
        this.publishCurrent();
        this.emit('velocity:change', {
            linear: this.linearInput,
            angular: this.angularInput
        });
    }

    getVelocity() {
        return {
            linear: this.linearInput,
            angular: this.angularInput,
        };
    }

    publishCurrent() {
        const msg = new ROSLIB.Message({
            linear: { x: this.linearInput * this.MAX_LINEAR },
            angular: { z: this.angularInput * this.MAX_ANGULAR },
        });
        if (this.ros.isConnected) {
            logger.info(
                `[WheelChair ROS TOPIC] publishing velocity with linear speed ${this.linearInput * this.MAX_LINEAR} and angular speed ${this.angularInput * this.MAX_ANGULAR}`
            );
            this.topic.publish(msg);
        } else {
            logger.warn(`[WheelChair ROS TOPIC] ros is not connected ignored publishing this message`);
        }
    }
}

const wheelChairHandler = new WheelChair();
export default wheelChairHandler;
