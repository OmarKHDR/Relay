import { ROSType } from '@/core/types/Ros.types.js';
import { HTTPMethod, type Routes } from '@/core/types/Routes.types.js';
import { RobotController } from './robot.controller.js';

export const RobotRouter: Routes = {
    base: '/robot',
    routes: [
        {
            name: 'get status',
            description: 'get robot status',
            method: HTTPMethod.GET,
            path: '/status',
            controller: RobotController.getStatus,
            middlewares: [],
            ROS: {
                ROSType: ROSType.ServiceClient,
                name: '/sanad_interfaces/RobotStatus',
                serviceType: 'string',
            },
        },
    ],
};
