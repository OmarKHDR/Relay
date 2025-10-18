import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class WheelChair {
    constructor() {
        if (WheelChair.instance) return WheelChair.instance;
		logger.info('[WheelChair] initializing wheelchair topic');
        this.ros = rosHandler.getRos();
        this.topic = this.createTopic();
        this.MAX_LINEAR = 1.0;
        this.MAX_ANGULAR = 2.0;
        this.linearInput = 0;
        this.angularInput = 0;
        WheelChair.instance = this;
    }

    createTopic() {
		logger.info('[WheelChair] creating wheelchair topic for controlling speed and angle');
        return new ROSLIB.Topic({
            ros: this.ros,
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist',
        });
    }

    setVelocity(linearInput, angularInput) {
		logger.info(`[WheelChair] setting velocity with ratio linear speed ${linearInput} and angular speed ${angularInput}`)
        this.linearInput = Math.max(-1, Math.min(1, linearInput));
        this.angularInput = Math.max(-1, Math.min(1, angularInput));
        this.publishCurrent();
    }

	getVelocity() {
		return {
			linear: this.linearInput,
			angular: this.angularInput
		}
	}

    publishCurrent() {
        const msg = new ROSLIB.Message({
            linear: { x: this.linearInput * this.MAX_LINEAR },
            angular: { z: this.angularInput * this.MAX_ANGULAR },
        });
        if (this.ros.isConnected) {
			logger.info(`[WheelChair] publishing velocity with linear speed ${this.linearInput * this.MAX_LINEAR} and angular speed ${this.angularInput * this.MAX_ANGULAR}`)
            this.topic.publish(msg);
        } else {
			logger.warn(`[WheelChair] ros is not connected ignored publishing this message`)
		}
    }
}

const wheelChairHandler = new WheelChair();
export default wheelChairHandler;
