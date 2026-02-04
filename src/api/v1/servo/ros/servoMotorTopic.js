import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class ServoMotor {
	constructor() {
		if (ServoMotor.instance) return ServoMotor.instance;

		logger.info('[ServoMotor] Initializing ServoMotor topic handler');
		this.ros = rosHandler.getRos();
		this.topic = this.createTopic();
		this.angle = undefined;

		ServoMotor.instance = this;
	}

	createTopic() {
		const topic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/servo_angle',
			messageType: 'std_msgs/UInt8',
		});
		logger.info('[ServoMotor] Topic created: /servo_angle (std_msgs/UInt8)');
		return topic;
	}

	publishAngle(angle) {
		if (typeof angle !== 'number' || angle < 0 || angle > 180) {
			logger.warn(`[ServoMotor] Invalid angle value: ${angle}`);
			return;
		}

		this.angle = angle;
		const msg = new ROSLIB.Message({ data: angle });

		if (this.ros.isConnected) {
			this.topic.publish(msg);
			logger.info(`[ServoMotor] Published angle: ${angle}`);
		} else {
			logger.warn('[ServoMotor] ROS not connected, publish skipped');
		}
	}

	getAngle() {
		if (this.angle !== undefined) {
			logger.info(`[ServoMotor] Returning cached angle value: ${this.angle}`);
			return this.angle;
		} else {
			logger.warn('[ServoMotor] Angle value is undefined');
			return undefined;
		}
	}
}

const servoMotorHandler = new ServoMotor();
export default servoMotorHandler;
