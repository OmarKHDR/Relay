import { RobotModule } from '#src/api/v1/robot/robot.module.ts';
import { Routes } from './types/Routes.types';
import { WSCallback } from './types/wsCallback.types';


export const CallbackRegistry: WSCallback[] = [];

export const RouterRegistry: Routes[] = [...RobotModule.routes];

// for async init of services on the modules
export const initialization: Function[] = [];
