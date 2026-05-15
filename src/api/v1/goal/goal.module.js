import goalRouter from './routes.js';
import './ros/goal.ros.service.js';
import './ros/goal.ros.action.js';

export const GoalModule = {
    routers: [goalRouter],
    WSCallback: [],
};
