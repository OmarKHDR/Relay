import poseRouter from './routes.js';
import './ros/pose.ros.topic.js';

export const PoseModule = {
    routers: [poseRouter],
    WSCallback: [],
};
