import { RobotModule } from '@/api/v1/robot/robot.module.js';
import type { Routes } from './types/Routes.types.js';
import type { WSCallback } from './types/wsCallback.types.js';


export const CallbackRegistry: WSCallback[] = [];

export const RouterRegistry: Routes[] = [...RobotModule.routes];

// for async init of services on the modules
export const initialization: Function[] = [];
