import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class SmartHomeRosTopic {
    constructor() {
        this.ros = null;
        this.deviceTopic = null;

        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[SMART HOME ROS TOPIC] ROS reconnected, refreshing topics...');
            this.ros = newRosInstance;
            this.createTopics();
        });
    }

    createTopics() {
        this.deviceTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: '/sanad/smart_home/devices',
            messageType: 'sanad_interfaces/msg/SmartDeviceEvent',
        });
    }

    publishDeviceEvent(action, deviceId, deviceData = null) {
        if (!this.deviceTopic) return;
        try {
            const msg = new ROSLIB.Message({
                action: action, // 'ADD', 'UPDATE', 'DELETE', 'DISCONNECT'
                deviceId: deviceId,
                deviceData: deviceData ? JSON.stringify(deviceData) : '',
            });
            this.deviceTopic.publish(msg);
        } catch (error) {
            logger.error(`[SMART HOME ROS TOPIC] Error publishing event: ${error.message}`);
        }
    }
}

export const smartHomeRosTopic = new SmartHomeRosTopic();
export default SmartHomeRosTopic;