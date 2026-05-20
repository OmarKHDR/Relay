import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';

class GoalRosService {
    constructor() {
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[GOAL ROS SERIVCE] ROS reconnected, refreshing subscription...');
            this.ros = newRosInstance;
            this.createService();
            this.createCancelRequest();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.createService();
            this.createCancelRequest();
        }
    }

    createService() {
        this.cancelService = new ROSLIB.Service({
            ros: this.ros,
            name: '/navigate_to_pose/_action/cancel_goal',
            serviceType: 'action_msgs/srv/CancelGoal',
        });
    }

    createCancelRequest() {
        this.cancelRequest = new ROSLIB.ServiceRequest({
            goal_info: {
                goal_id: { uuid: new Array(16).fill(0) }, // Zero UUID = Cancel Everything
                stamp: { sec: 0, nanosec: 0 },
            },
        });
    }

    async forceCancelAll() {
        if (!this.cancelRequest) {
            this.createCancelRequest();
        }
        if (!this.cancelService) throw new Error('goal cancel service is not connected');
        return new Promise( (resolve, reject) => {
            this.cancelService.callService(
                this.cancelRequest,
                result => {
                    logger.info('[GOAL ROS SERVICE] Cancel command executed successfully');
                    resolve(result)
                },
                error => {
                    logger.error('[GOAL ROS SERVICE] Failed to execute cancel command:');
                    reject(error instanceof Error ? error : new Error(String(error)));
                }
            );
        })
    }
}

export default new GoalRosService();
