import type { Request, Response } from 'express';
import { robotService } from './robot.service.js';

export class RobotController {
    static async getStatus(req: Request, res: Response) {
        if (!req.ros) {
            throw new Error('ROS communication is not mounted for this route');
        }

        return await robotService.getStatus(req.ros);
    }
}
