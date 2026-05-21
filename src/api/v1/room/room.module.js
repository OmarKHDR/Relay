import { RoomRouter } from './routes.js';
import './ros/room.ros.topic.js';
import './ros/room.ros.service.js';
import { roomService } from './room.service.js';

export const RoomModule = {
    routers: [RoomRouter],
    services: [roomService],
};

