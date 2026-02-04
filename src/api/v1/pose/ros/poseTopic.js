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

        this.topic = new ROSLIB.Topic({
            ros: this.ros,
            name: '/amcl_pose',
            messageType: 'geometry_msgs/PoseWithCovarianceStamped',
        });

        this.subscribe();
        Pose.instance = this;
    }

    subscribe() {
        this.topic.subscribe(msg => {
            const p = msg.pose.pose;
            const yaw = quaternionToYaw(p.orientation);

            const newPose = {
                frame: msg.header.frame_id, // "map"
                x: p.position.x,
                y: p.position.y,
                yaw,
								stamp: msg.header.stamp?.secs * 1000 || Date.now(),
            };

            this.pose = newPose;
        });
    }

    getPose() {
        return this.pose;
    }
}

function quaternionToYaw(q) {
    return Math.atan2(
        2 * (q.w * q.z + q.x * q.y),
        1 - 2 * (q.y * q.y + q.z * q.z)
    );
}

export default new Pose();
