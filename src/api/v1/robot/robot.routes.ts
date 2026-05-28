import { ROSType } from '#core/types/Ros.types.ts';
import { HTTPMethod, type Routes } from '#core/types/Routes.types.ts';

export const RobotRouter: Routes = {
    base: '/robot',
    routes: [
        {
            name: 'get status',
            description: 'get robot status',
            method: HTTPMethod.GET,
            path: '/status',
            controller: () => {},
            middlewares: [],
            ROS: {
                ROSType: ROSType.ServiceClient,
                name: '/sanad_interfaces/RobotStatus',
                serviceType: 'string',
                callback: () => true,
                errorCallback: () => {},
            },
        },
    ],
};
