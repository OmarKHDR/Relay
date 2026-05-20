import { RoomRouter } from './routes.js';
import roomRosTopic from './ros/room.ros.topic.js';
import roomRosService from './ros/room.ros.service.js';

export const RoomModule = {
    routers: [RoomRouter],
};

export default RoomModule;
