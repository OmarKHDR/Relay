import { ROSType, type RosMount, type RosServiceClientMount } from '@/core/types/Ros.types.js';

class RobotService {
    async getStatus(ros: RosMount) {
        if (ros.kind === ROSType.ServiceClient) {
            const requestMessage = ros.request({});
            const service = ros.service;
            return await service(requestMessage);
        }
        throw new Error(`type of ros is not what getStatus method expect`)
    }
}

export const robotService = new RobotService();
