import { MapModule } from '#modules/map/map.module.js';
import { ServoModule } from '#modules/servo/servo.module.js';
import { UltrasonicModule } from '#modules/ultrasonic/ultrasonic.module.js';
import { WheelchairModule } from '#modules/wheelchair/wheelchair.module.js';
import { PoseModule } from '#modules/pose/pose.module.js';
import { GoalModule } from '#modules/goal/goal.module.js';

export const RouterRegistry = [
    ...MapModule.routers,
    ...ServoModule.routers,
    ...UltrasonicModule.routers,
    ...WheelchairModule.routers,
    ...PoseModule.routers,
    ...GoalModule.routers,
];
