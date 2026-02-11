import goalRosTopic from './ros/goal.ros.topic.js';
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
        if (goalRosTopic.status.isActive) {
            throw new Error('Robot is already executing a goal.');
        }

        logger.info(`[GoalService] Processing goal: x=${x}, y=${y}`);

        const poseMessage = this._createPoseMessage(x, y, yaw, frame);
        goalRosAction.executeGoal(poseMessage);
    }

    async cancelGoal() {
        // 1. Check Topic (Eyes) - only cancel if actually busy
        if (!goalRosTopic.status.isActive) {
            return false;
        }

        logger.info('[GOAL SERVICE] Initiating cancel sequence...');

        await goalRosService.forceCancelAll();

        return true;
    }

    getGoal() {
        const goal = goalRosTopic.goalCoordinates;
        goal.yaw = this._quaternionToYaw(goal.q);
        return {
            status: goalRosTopic.status,
            goal,
        };
    }

    getFeedback() {
        const feedback = goalRosTopic.feedback;
        return { status: goalRosTopic.status, feedback: feedback || {} };
    }

    // some helper methods

    _createPoseMessage(x, y, yaw, frame = 'map') {
        // Default to 'map'
        const q = this._yawToQuaternion(yaw);

        return {
            pose: {
                header: {
                    frame_id: frame,
                    stamp: {
                        secs: 0,
                        nsecs: 0,
                    },
                },
                pose: {
                    position: { x, y, z: 0 },
                    orientation: q,
                },
            },
        };
    }

    _yawToQuaternion(yaw) {
        return {
            x: 0,
            y: 0,
            z: Math.sin(yaw / 2),
            w: Math.cos(yaw / 2),
        };
    }

    _quaternionToYaw(quaternion) {
        const { x, y, z, w } = quaternion;
        return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
    }
}

export default new GoalService();
