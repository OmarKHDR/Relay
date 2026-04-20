import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import EventEmitter from 'events';
import logger from '#utils/logger.js';

class Pose extends EventEmitter {
    constructor() {
        if (Pose.instance) return Pose.instance;
        super();
        this.initParams();
        rosHandler.on('ros_reconnected', (newRosInstance) => {
            logger.info('[POSE ROS TOPIC] ROS reconnected, creating new subscription...');
            this.ros = newRosInstance;
            this.poseTopic = this.createTopic();
            this.subscribe();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.poseTopic = this.createTopic();
            this.subscribe();
        }
        Pose.instance = this;
    }

    initParams(){
        this.pose = null;
    }
    createTopic() {
        return new ROSLIB.Topic({
            ros: this.ros,
            name: '/amcl_pose',
            messageType: 'geometry_msgs/msg/PoseWithCovarianceStamped'
        });
    }
    
    subscribe() {
        const startSubscription = () => {
            console.log(this.pose);
            this.poseTopic.subscribe((msg) => {
                const newPose = {
                    frame: msg.header.frame_id || 'map',
                    x: msg.pose.pose.position.x,
                    y: msg.pose.pose.position.y,
                    q: msg.pose.pose.orientation,
                    stamp: Date.now(),
                };
                logger.info(`[POSE ROS TOPIC] Pose =  ${newPose}`);
                this.pose = newPose;
                this.emit('pose', newPose);
            });
        }

        if (this.ros.isConnected) {
            logger.info('[POSE ROS TOPIC] ROS connected — subscribing now');
            startSubscription();
        } else {
            logger.warn('[POSE ROS TOPIC] ROS not connected — waiting for connection to subscribe');
            this.ros.on('connection', () => {
                logger.info('[POSE ROS TOPIC] ROS connected — subscribing now');
                startSubscription();
            });
        }
    }

    getPose() {
        return this.pose;
    }
    
    unsubscribe() {
        if (this.poseTopic) {
            this.poseTopic.unsubscribe();
        }
    }
}

export default new Pose();