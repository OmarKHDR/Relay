import goalRosAction from './ros/goal.ros.action.js';
import goalRosService from './ros/goal.ros.service.js';
import logger from '#utils/logger.js';

class GoalService {
    constructor() {
        if (GoalService.instance) return GoalService.instance;
        this.feedback = null;
        GoalService.instance = this;
    }

    sendGoal({ x, y, yaw, frame = 'map' }) {
        logger.info(`[GoalService] Processing goal: x=${x}, y=${y}`);
        const poseMessage = this._createPoseMessage(x, y, yaw, frame);
        const goalId = goalRosAction.executeGoal(poseMessage);
        return goalId;
    }

    async cancelGoal() {
        logger.info('[GOAL SERVICE] Initiating cancel sequence...');
        await goalRosService.forceCancelAll();
        console.log("cleared goal")
        goalRosAction.clearGoal();

        return true;
    }

    getGoal() {
        return goalRosAction.getGoal();
    }

    getFeedback() {
        const feedback = goalRosAction.getFeedback();
        return { feedback: feedback };
    }

    // some helper methods

    _createPoseMessage(x, y, yaw, frame = 'map') {
        // Default to 'map'
        const q = this._yawToQuaternion(yaw);

        return {
            pose: {
                header: {
                    frame_id: frame,
                    stamp: { sec: Math.floor(Date.now() / 1000), nanosec: 0 },
                },
                pose: {
                    position: { x, y, z: 0.0 },
                    orientation: q,
                },
            },
        };
    }

    _yawToQuaternion(yaw) {
        return {
            x: 0.0,
            y: 0.0,
            z: Math.sin(yaw / 2) ?? 0,
            w: Math.cos(yaw / 2) || 1,
        };
    }

    _quaternionToYaw(quaternion) {
        const { x, y, z, w } = quaternion;
        return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
    }
}

export default new GoalService();
