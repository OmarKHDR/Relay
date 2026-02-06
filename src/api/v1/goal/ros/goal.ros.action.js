import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';

class GoalRosAction {
    constructor() {
        this.ros = rosHandler.getRos();
        this.createAction();
        // Action Client strictly for sending new goals
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
