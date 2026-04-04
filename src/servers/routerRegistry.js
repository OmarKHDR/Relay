import { MapModule } from '#modules/map/map.module.js';
import { WheelchairModule } from '#modules/wheelchair/wheelchair.module.js';
import { PoseModule } from '#modules/pose/pose.module.js';
import { GoalModule } from '#modules/goal/goal.module.js';
import { IrdbModule } from '#modules/irdb/irdb.module.js';
import { IrModule } from '#modules/ir/ir.module.js';

export const RouterRegistry = [
    ...MapModule.routers,
    ...WheelchairModule.routers,
    ...PoseModule.routers,
    ...GoalModule.routers,
    ...IrdbModule.routers,
    ...IrModule.routers,
];
