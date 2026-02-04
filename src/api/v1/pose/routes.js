import { Router } from 'express';
import { getPose } from '#modules/pose/poseController.js';

const poseRouter = Router();

//pose routes
poseRouter.get('/pose/', getPose);

export default poseRouter;
