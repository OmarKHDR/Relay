import goalRouter from './routes.js';
import './ros/goal.ros.topic.js';

export const GoalModule = {
    routers: [goalRouter],
    WSCallback: [],
};
