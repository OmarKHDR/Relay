import { Router } from 'express';
import { getDistance } from '#modules/ultrasonic/ultrasonicController.js';

const ultrasonicRouter = Router();

// ultrasonic
ultrasonicRouter.get('/sensors/ultrasonic/', getDistance);

export default ultrasonicRouter;
