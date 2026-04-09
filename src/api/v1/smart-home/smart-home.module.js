import { SmartHomeRoutes } from './routes.js';
import './ros/smart-home.ros.service.js';

export const SmartHomeModule = {
    routers: [SmartHomeRoutes],
};

export default SmartHomeModule;
