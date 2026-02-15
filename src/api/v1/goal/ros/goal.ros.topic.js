import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import { ROS_GOAL_STATUSES } from './goal.status.js';
import logger from '#utils/logger.js';

class GoalRosTopic {
    constructor() {
        this.initParams();
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[GOAL ROS TOPIC] ROS reconnected, refreshing subscription...');
            this.ros = newRosInstance;
            this.createTopic();
            this.subscribe();
        });
    }

    initParams() {
        this.status = ROS_GOAL_STATUSES[0];
    }

    createTopic() {
        this.statusTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: '/navigate_to_pose/_action/status',
            messageType: 'action_msgs/msg/GoalStatusArray',
        });
        
        this.feedbackListener = new ROSLIB.Topic({
            ros: this.ros,
            name: '/navigate_to_pose/_action/feedback',
            messageType: 'nav2_msgs/action/NavigateToPose_FeedbackMessage',
        });

        this.goalListener = new ROSLIB.Topic({
            ros: this.ros,
            name: '/goal_pose', 
            messageType: 'geometry_msgs/msg/PoseStamped',
        });
    }

    subscribe() {
        const startSubscription = () => {
            this.statusTopic.subscribe(msg => {
                this.handleStatusCode(msg);
            });
            
            this.goalListener.subscribe(msg => {
                const poseData = msg.pose;
                if (!poseData) return;
                this.goalCoordinates = {
                    x: poseData.position.x,
                    y: poseData.position.y,
                    q: poseData.orientation,
                    frame: msg.header?.frame_id || 'map',
                };
            });
            logger.info(`[GOAL ROS TOPIC] Caught external goal coordinates:${this.goalCoordinates}`);

            this.feedbackListener.subscribe(msg => {
                // In ROS 2, the actual feedback data is nested inside a 'feedback' object
                if (msg.feedback) {
                    this.feedback = this.formatFeedback(msg.feedback);
                } else {
                    logger.error(`[GOAL ROS TOPIC] feedback is not defined ${JSON.stringify(msg)}`);
                }
            });
        };

        if (this.ros?.isConnected) {
            startSubscription();
        } else {
            logger.warn('[GOAL ROS TOPIC] ROS not connected — waiting for connection to subscribe');
            this.ros?.on('connection', () => {
                logger.info('[GOAL ROS TOPIC] ROS connected — subscribing now');
                startSubscription();
            });
        }
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

    formatFeedback(feedback) {
        return {
            x: feedback.current_pose?.pose?.position?.x,
            y: feedback.current_pose?.pose?.position?.y,
            navigation_time: feedback.navigation_time?.sec,
            estimated_time_remaining: feedback.estimated_time_remaining?.sec,
            number_of_recoveries: feedback.number_of_recoveries,
            distance_remaining: feedback.distance_remaining,
        };
    }
}

export default new GoalRosTopic();