import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class WheelChair {
    constructor() {
        if (ServoMotor.instance) {
            return ServoMotor.instance;
        }
		logger.info('[WheelChair] initializing ServoMotor Topic handler')
		this.ros = rosHandler.getRos();
		this.topic = this.createTopic();
		this.velocity = undefined;
		WheelChair.instance = this;
    }

	createTopic() {
		const WheelChairTopic = new ROSLIB.Topic({
			ros: this.ros,
			name:'/cmd_vel',
			messageType: 'std_msgs/UInt8',
		})
		logger.info('[WheelChair] Topic created: /cmd_vel (std_msgs/UInt8)')
		return WheelChairTopic;
	}

	publishVelocity(v) {
		this.angle = v;
		const msg = new ROSLIB.Message({
			data: v,
		});
		if (this.ros.isConnected) {
			this.topic.publish(msg);
			logger.info(`[WheelChair] Published velocity: ${v}`);
		}
		else logger.warn('[WheelChair] ROS not connected, message skipped');
	}
	
	getVelocity() {
        if (this.velocity !== undefined) {
            logger.info(`[WheelChair] Returning velocity value: ${this.velocity}`);
            return this.velocity
        } else {
            logger.warn('[WheelChair] velocity value is undefined');
            return undefined;
        }
	}
}

const wheelChairHandler = new WheelChair();
export default wheelChairHandler;