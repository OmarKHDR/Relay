import PoseHandler from './ros/pose.ros.topic.js';

class PoseService {
    getPose() {
        const pose = PoseHandler.getPose();
        if (!pose) {
            throw new Error('Pose info are not available');
        }
        data = {
            frame: pose.frame,
            x: pose.x,
            y: pose.y,
            yaw: pose.yaw,
						stamp: pose.stamp,
        };
        return data;
    }
}

export default new 
PoseService();
