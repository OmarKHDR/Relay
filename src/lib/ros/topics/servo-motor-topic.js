import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class ServoMotor {
    constructor() {
        if (ServoMotor.instance) {
            return ServoMotor.instance;
        }
		logger.info('[ServoMotor] initializing ServoMotor Topic handler')
		this.ros = rosHandler.getRos();
		this.topic = this.createTopic();
		this.angle = undefined;
		ServoMotor.instance = this;
    }

	createTopic() {
		const servoTopic = new ROSLIB.Topic({
			ros: this.ros,
			name:'/servo_angle',
			messageType: 'std_msgs/UInt8',
		})
		logger.info('[ServoMotor] Topic created: /servo_angle (std_msgs/UInt8)')
		return servoTopic;
	}

	publishAngle(n) {
		this.angle = n;
		const msg = new ROSLIB.Message({
			data: n,
		});
		if (this.ros.isConnected) {
			this.topic.publish(msg);
			logger.info(`[ServoMotor] Published angle: ${n}`);
		}
		else logger.warn('[ServoMotor] ROS not connected, message skipped');
	}

	getAngle() {
        if (this.angle !== undefined) {
            logger.info(`[ServoMotor] Returning angle value: ${this.angle}`);
            return this.distance;
        } else {
            logger.warn('[ServoMotor] angle value is undefined');
            return undefined;
        }	
	}
}

const servoMotorHandler = new ServoMotor();
export default servoMotorHandler;