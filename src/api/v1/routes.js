import Router from 'express'
import servoRouter from './servo-routes';
import ultrasonicRouter from './ultrasonic-router';
import wheelchairRouter from './wheelchair-router';

const apiRouter = Router();

// servo routes
apiRouter.use('/servo-motor/', servoRouter);

// wheelchair
apiRouter.use('/wheelchair/', wheelchairRouter);

// ultrasonic
apiRouter.use('/sensors/ultrasonic/', ultrasonicRouter);

export default apiRouter;