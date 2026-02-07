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
        
        // Create TF client to get transforms
        this.tfClient = new ROSLIB.TFClient({
            ros: this.ros,
            fixedFrame: 'map',           // Global reference frame
            angularThres: 0.01,          // Angular threshold for updates (radians)
            transThres: 0.01,            // Translation threshold for updates (meters)
            rate: 10.0,                  // Update rate in Hz
        });
        
        this.subscribe();
        Pose.instance = this;
    }

    subscribe() {
        // Subscribe to transform from 'map' to 'base_link'
        // Note: Use 'base_footprint' if your robot uses that instead
        this.tfClient.subscribe('base_link', (tf) => {
            const yaw = quaternionToYaw(tf.rotation);
            const newPose = {
                frame: 'map',
                x: tf.translation.x,
                y: tf.translation.y,
                yaw,
                stamp: Date.now(),
            };
            
            this.pose = newPose;
            this.emit('pose', newPose); // Emit event for listeners
        });
    }

    getPose() {
        return this.pose;
    }
    
    // Cleanup method for graceful shutdown
    unsubscribe() {
        if (this.tfClient) {
            this.tfClient.unsubscribe('base_link');
        }
    }
}

function quaternionToYaw(q) {
    return Math.atan2(
        2 * (q.w * q.z + q.x * q.y),
        1 - 2 * (q.y * q.y + q.z * q.z)
    );
}

export default new Pose();