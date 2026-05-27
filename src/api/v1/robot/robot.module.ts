import { RobotRouter } from './robot.routes.js';
import { RobotDB } from './robot.db.js';
import { Module } from '#src/core/types/module.types.js';

export const RobotModule: Module = {
    routes: [RobotRouter],
    initialization: [RobotDB.init],
};
