import { ROS, RosMount } from '#src/core/types/Ros.types.ts';
import { NextFunction, Request, Response } from 'express';

export function rosInjector(ros: RosMount) {
    return (req: Request, res: Response, next: NextFunction) => {
        req.ros = ros;
        next();
    };
}
