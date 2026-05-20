import { MapModule } from '#modules/map/map.module.js';
import { WheelchairModule } from '#modules/wheelchair/wheelchair.module.js';
import { PoseModule } from '#modules/pose/pose.module.js';
import { GoalModule } from '#modules/goal/goal.module.js';
import { SmartHomeModule } from '#modules/smart-home/smart-home.module.js';
import RoomModule from '#src/api/v1/room/room.module.js';


export const RouterRegistry = [
    ...RoomModule.routers,
    ...MapModule.routers,
    ...WheelchairModule.routers,
    ...PoseModule.routers,
    ...GoalModule.routers,
    ...SmartHomeModule.routers,
];
