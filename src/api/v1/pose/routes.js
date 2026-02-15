import { Router } from 'express';
import { getPose } from './pose.controller.js';

const poseRouter = Router();

//pose routes
poseRouter.get('/pose/', getPose);

export default poseRouter;
