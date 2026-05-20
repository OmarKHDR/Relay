import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class SmartHomeTopic {
    constructor() {
        if (SmartHomeTopic.instance) return SmartHomeTopic.instance;
        logger.info('[SmartHome ROS TOPIC] Initializing SmartHome topic handler');
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[SmartHome ROS TOPIC] ROS reconnected, refreshing subscription...');
            this.ros = newRosInstance;
            this.topic = this.createTopic();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.topic = this.createTopic();
        }
        SmartHomeTopic.instance = this;
    }

    createTopic() {
        const deviceTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: '/SmartHome/DeviceEvents',
            messageType: '/sanad_interfaces/msg/DeviceEvent',
        });
        logger.info('[SmartHome ROS TOPIC] Topic created: /SmartHome/DeviceEvents');
        return deviceTopic;
    }

    publishDeviceEvent(eventname, device) {
        if (!this.topic) return;
        const message = new ROSLIB.Message({
            event: eventname,
            device: JSON.stringify(device),
        });
        switch (eventname) {
            case 'NEW_DEVICE':
            case 'DISCONNECTED':
            case 'UPDATE':
                this.topic.publish(message);
                break;
            default:
                logger.warn(`[SMART-HOME] event name is not supported: ${eventname}`);
        }
    }
}

const smartHomeRosTopic = new SmartHomeTopic();
export default smartHomeRosTopic;
