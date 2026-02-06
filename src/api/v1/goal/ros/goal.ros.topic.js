import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import { ROS_GOAL_STATUSES } from './goal.status.js';
import logger from '#utils/logger.js';

class GoalRosTopic {
    constructor() {
        this.ros = rosHandler.getRos();
        this.createTopic();
        this.status = ROS_GOAL_STATUSES[0];
        this.start();
    }

    createTopic() {
        this.statusTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: '/navigate_to_pose/_action/status',
            messageType: 'action_msgs/msg/GoalStatusArray',
        });
        this.goalListener = new ROSLIB.Topic({
            ros: this.ros,
            name: '/navigate_to_pose/_action/send_goal',
            messageType: 'nav2_msgs/action/NavigateToPose_Goal',
        });
        this.feedbackListener = new ROSLIB.Topic({
            ros: this.ros,
            name: '/navigate_to_pose/_action/feedback',
            messageType: 'nav2_msgs/action/NavigateToPose_FeedbackMessage',
        });
    }

    start() {
        if (this.ros.isConnected) {
            this.subscribe();
        } else {
            logger.warn('[GOAL ROS TOPIC] ROS not connected — waiting for connection to subscribe');
            this.ros.on('connection', () => {
                logger.info('[GOAL ROS TOPIC] ROS connected — subscribing now');
                this.subscribe();
            });
        }
    }

    subscribe() {
        this.statusTopic.subscribe(msg => {
            this.handleStatusCode(msg);
        });

        this.goalListener.subscribe(msg => {
            const pose = msg.goal.pose.pose;
            this.goalCoordinates = {
                x: pose.position.x,
                y: pose.position.y,
                q: pose.orientation,
                frame: msg.goal.pose.header.frame_id,
            };
            logger.info(`[GoalTopic] Caught external goal coordinates:`, this.goalCoordinates);
        });

        this.feedbackListener.subscribe(msg => {
            this.feedback = this.formatFeedback(msg);
        });
    }

    handleStatusCode(msg) {
        const statusList = msg.status_list || [];
        const lastGoal = statusList[statusList.length - 1];

        if (!lastGoal) {
            this.status = ROS_GOAL_STATUSES[0];
            return;
        }
        this.status = ROS_GOAL_STATUSES[lastGoal.status] || ROS_GOAL_STATUSES[0];
    }

    formatFeedback(msg) {
        const { feedback } = msg;
        const { pose } = feedback.current_pose;

        return {
            position: pose.position,
            q: pose.orientation,
            navigation_time: feedback.navigation_time,
            estimated_time_remaining: feedback.estimated_time_remaining,
            number_of_recoveries: feedback.number_of_recoveries,
            distance_remaining: feedback.distance_remaining,
        };
    }
}

export default new GoalRosTopic();
