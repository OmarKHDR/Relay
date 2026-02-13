import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import EventEmitter from 'events';
import logger from '#utils/logger.js';

class Pose extends EventEmitter {
    constructor() {
        if (Pose.instance) return Pose.instance;
        super();
        this.ros = rosHandler.getRos();
        this.pose = null;
        
        this.tfClient = this.createTopic();
        this.subscribe();
        Pose.instance = this;
    }

    createTopic() {
        const client = new ROSLIB.TFClient({
            ros: this.ros,
            fixedFrame: 'map',
            angularThres: 0.01,
            transThres: 0.01,
            rate: 10.0,
        });
        return client;
    }
    subscribe() {
        const startSubscription = () => {
            console.log(this.pose)
            this.tfClient.subscribe('base_link', (tf) => {
                const newPose = {
                    frame: 'map',
                    x: tf.translation.x,
                    y: tf.translation.y,
                    q: tf.rotation,
                    stamp: Date.now(),
                };
                logger.info('[POSE ROS TOPIC] Pose = ', newPose);
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
        if (this.tfClient) {
            this.tfClient.unsubscribe('base_link');
        }
    }
}


export default new Pose();