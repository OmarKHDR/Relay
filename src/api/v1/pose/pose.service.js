import PoseHandler from './ros/pose.ros.topic.js';

class PoseService {
    _quaternionToYaw(quat) {
        const { x, y, z, w } = quat;
        return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
    }
    getPose() {
        const pose = PoseHandler.getPose();
        if (!pose) {
            throw new Error('Pose info are not available');
        }
        const yaw = this._quaternionToYaw(pose.q)
        const data = {
            frame: pose.frame,
            x: pose.x,
            y: pose.y,
            yaw,
			stamp: pose.stamp,
        };
        return data;
    }
}

export default new 
PoseService();
