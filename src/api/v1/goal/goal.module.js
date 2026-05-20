import { GoalRouter } from './routes.js';
import './ros/goal.ros.service.js';
import './ros/goal.ros.action.js';

export const GoalModule = {
    routers: [GoalRouter],
    WSCallback: [],
};
