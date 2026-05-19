import { MapModule } from '#modules/map/map.module.js';
import { WheelchairModule } from '#modules/wheelchair/wheelchair.module.js';
import { PoseModule } from '#modules/pose/pose.module.js';
import { GoalModule } from '#modules/goal/goal.module.js';
import { SmartHomeModule } from '#modules/smart-home/smart-home.module.js';


export const RouterRegistry = [
    ...MapModule.routers,
    ...WheelchairModule.routers,
    ...PoseModule.routers,
    ...GoalModule.routers,
    ...SmartHomeModule.routers,
];
