import Router from 'express'
import { getServoAngle, setServoAngle } from "#controllers/servoController.js";
import { getWheelchairDirection, setWheelchairDirection } from "#controllers/wheelchairCotnroller.js";
import { getDistance } from "#controllers/ultrasonicController.js";


const apiRouter = Router();

// servo routes
apiRouter.post('/servo-motor/', setServoAngle);
apiRouter.get('/servo-motor/', getServoAngle);

// wheelchair
apiRouter.post('/wheelchair/direction/', setWheelchairDirection);
apiRouter.get('/wheelchair/direction/', getWheelchairDirection);

// ultrasonic
apiRouter.get('/sensors/ultrasonic/', getDistance);

export default apiRouter;