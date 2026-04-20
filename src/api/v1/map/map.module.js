import mapRouter from './routes.js';
import './ros/map.ros.topic.js';

export const MapModule = {
    routers: [mapRouter],
    WSCallback: [],
};
