import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
class GoalRosAction {
    constructor() {
        rosHandler.on('ros_reconnected', (newRosInstance) => {
            logger.info('[GOAL ROS ACTION] ROS reconnected, refreshing subscription...');
            this.ros = newRosInstance;
            this.createAction();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
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
    /**
     * Sends the goal and returns the ROSLIB Goal object.
     * This object emits events (feedback, result) that the Service layer listens to.
     */
    executeGoal(poseMessage) {
        const goal = new ROSLIB.Goal({
            actionClient: this.client,
            goalMessage: poseMessage,
        });

        goal.send();
        return goal;
    }
}

export default new GoalRosAction();
