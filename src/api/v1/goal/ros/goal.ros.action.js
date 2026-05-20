import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
class GoalRosAction {
    constructor() {
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[GOAL ROS ACTION] ROS reconnected, refreshing subscription...');
            this.ros = newRosInstance;
            this.currentGoal = null;
            this.feedback = null;
            this.result = null;
            this.status = null;
            this.createAction();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.currentGoal = null;
            this.feedback = null;
            this.result = null;
            this.status = null;
            this.createAction();
        }
    }

    createAction() {
        this.client = new ROSLIB.ActionClient({
            ros: this.ros,
            serverName: '/navigate_to_pose',
            actionName: 'nav2_msgs/action/NavigateToPose',
        });
    }

    executeGoal(poseMessage) {
        if (!this.client) throw new Error('goal action client is not connected');
        const goal = new ROSLIB.Goal({
            actionClient: this.client,
            goalMessage: poseMessage,
        });
        this.currentGoal = goal;
        this.feedback = null;
        this.result = null;
        this.status = null;
        this.attachGoalFeedback(goal);
        this.attachGoalResult(goal);
        this.attachGoalStatus(goal);
        goal.send();
        return goal.goalID;
    }

    attachGoalFeedback(goal) {
        goal.on('feedback', feedback => {
            this.feedback = feedback;
        });
    }

    attachGoalStatus(goal) {
        goal.on('status', status => {
            this.status = status;
        });
    }

    getFeedback() {
        return this.feedback;
    }

    getGoal() {
        if (!this.currentGoal) throw new Error('no active goal');
        const pose = this.currentGoal.goalMessage?.goal?.pose;
        const position = pose?.pose?.position ?? {};
        const orientation = pose?.pose?.orientation ?? {};
        return {
            goal_id: this.currentGoal.goalID,
            frame_id: pose?.header?.frame_id,
            x: position.x,
            y: position.y,
            yaw: this.quaternionToYaw(orientation),
            status: this.status,
            feedback: this.feedback,
            result: this.result,
            is_finished: this.currentGoal.isFinished,
        };
    }

    attachGoalResult(goal) {
        goal.on('result', result => {
            this.result = result;
        });
    }

    clearGoal() {
        this.currentGoal = null;
        this.feedback = null;
        this.result = null;
        this.status = null;
    }

    quaternionToYaw(quaternion = {}) {
        const { x = 0, y = 0, z = 0, w = 1 } = quaternion;
        return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
    }
}

export default new GoalRosAction();
