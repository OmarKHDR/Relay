import { Router } from 'express';
import { getPose } from '#modules/pose/poseController.js';

const poseApi = Router();

//pose routes
poseApi.get('/pose/', getPose);

export default poseRouter;
