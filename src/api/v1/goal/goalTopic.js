import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class NavGoal {
    constructor() {
        if (NavGoal.instance) return NavGoal.instance;

        this.ros = rosHandler.getRos();

        // Active goal state
        this.currentGoal = null; // {x, y, yaw, frame}
        this.status = 'IDLE'; // IDLE | PENDING | ACTIVE | CANCELING | SUCCEEDED | FAILED | CANCELED
        this.feedback = null; // Latest feedback from Nav2
        this.goalHandle = null; // ROSLIB.Goal object

        // Action client
        this.client = new ROSLIB.ActionClient({
            ros: this.ros,
            serverName: '/navigate_to_pose',
            actionName: 'nav2_msgs/action/NavigateToPose',
        });

        NavGoal.instance = this;
    }

    sendGoal({ x, y, yaw, frame = 'map' }) {
        if (this.goalHandle) {
            throw new Error('A navigation goal is already active.');
        }

        logger.info(`[NavGoal] Sending goal x=${x}, y=${y}, yaw=${yaw}`);

        const q = this.yawToQuaternion(yaw);

        const now = Date.now();
        const goal = new ROSLIB.Goal({
            actionClient: this.client,
            goalMessage: {
                pose: {
                    header: {
                        frame_id: frame,
                        stamp: {
                            secs: Math.floor(now / 1000),
                            nsecs: (now % 1000) * 1e6,
                        },
                    },
                    pose: {
                        position: { x, y, z: 0 },
                        orientation: q,
                    },
                },
            },
        });

        // Set initial state
        this.status = 'PENDING';
        this.currentGoal = { x, y, yaw, frame };
        this.feedback = null;
        this.goalHandle = goal;

        // Feedback handler
        goal.on('feedback', fb => {
            this.status = 'ACTIVE';
            this.feedback = fb;
        });

        // Result handler
        goal.on('result', result => {
            if (result?.error_code === 0) {
                this.status = 'SUCCEEDED';
                logger.info('[NavGoal] Goal succeeded');
            } else if (this.status === 'CANCELING') {
                this.status = 'CANCELED';
                logger.info('[NavGoal] Goal canceled');
            } else {
                this.status = 'FAILED';
                logger.warn('[NavGoal] Goal failed', result);
            }

            // Clean up
            this.goalHandle = null;
            this.currentGoal = null;
            this.feedback = null;
        });

        goal.send();
    }

    cancelGoal() {
        if (!this.goalHandle) {
            logger.warn('[NavGoal] No active goal to cancel');
            return false;
        }

        logger.info('[NavGoal] Canceling current goal...');
        this.status = 'CANCELING';
        this.goalHandle.cancel();
        return true;
    }

    getCurrentGoal() {
        return {
            goal: this.currentGoal,
            status: this.status,
            feedback: this.feedback || null,
        };
    }

    yawToQuaternion(yaw) {
        return {
            x: 0,
            y: 0,
            z: Math.sin(yaw / 2),
            w: Math.cos(yaw / 2),
        };
    }
}

export default new NavGoal();
