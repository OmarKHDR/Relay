import { SmartHomeRouter } from './routes.js';
import './ros/smart-home.ros.topic.js';
import './ros/smart-home.ros.service.js';
import { smartHomeService } from './smart-home.service.js';

export const SmartHomeModule = {
    routers: [SmartHomeRouter],
    services: [smartHomeService],
};

export default SmartHomeModule;
