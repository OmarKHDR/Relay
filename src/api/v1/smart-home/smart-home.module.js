import { SmartHomeRouter } from './routes.js';
import smartHomeRosTopic from './ros/smart-home.ros.topic.js';
import smartHomeRosService from './ros/smart-home.ros.service.js';

export const SmartHomeModule = {
    routers: [SmartHomeRouter],
};

export default SmartHomeModule;
