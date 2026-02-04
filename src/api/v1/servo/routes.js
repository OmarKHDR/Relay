import { Router } from 'express';
import { getServoAngle, setServoAngle } from '#modules/servo/servoController.js';

const servoRouter = Router();

servoRouter.post('/servo-motor/', setServoAngle);

servoRouter.get('/servo-motor/', getServoAngle);

export default servoRouter;
