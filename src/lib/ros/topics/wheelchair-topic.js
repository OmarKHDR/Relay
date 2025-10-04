import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class WheelChair {
	constructor() {
		if (WheelChair.instance) return WheelChair.instance;

		logger.info('[WheelChair] Initializing WheelChair topic handler');
		this.ros = rosHandler.getRos();
		this.topic = this.createTopic();
		this.direction = undefined;

		WheelChair.instance = this;
	}

	createTopic() {
		const topic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/cmd_vel',
			messageType: 'std_msgs/UInt8', // expected on ROS side
		});
		logger.info('[WheelChair] Topic created: /cmd_vel (std_msgs/UInt8)');
		return topic;
	}

	move(direction) {
		const allowed = ['stop', 'forward', 'backward', 'left', 'right'];
		if (!allowed.includes(direction)) {
			logger.error(`[WheelChair] Invalid direction: ${direction}`);
			return;
		}

		const code = allowed.indexOf(direction); // 0–4
		this.direction = direction;

		const msg = new ROSLIB.Message({ data: code });

		if (this.ros.isConnected) {
			this.topic.publish(msg);
			logger.info(`[WheelChair] Published direction: ${direction} (code ${code})`);
		} else {
			logger.warn('[WheelChair] ROS not connected, message skipped');
		}
	}

	getDirection() {
		if (this.direction !== undefined) {
			logger.info(`[WheelChair] Returning direction value: ${this.direction}`);
			return this.direction;
		} else {
			logger.warn('[WheelChair] Direction value is undefined');
			return undefined;
		}
	}
}

const wheelChairHandler = new WheelChair();
export default wheelChairHandler;
