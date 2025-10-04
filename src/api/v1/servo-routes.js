import Router from "express";
import { getServoAngle, setServoAngle } from "#controllers/servoController.js";
const servoRouter = Router();


servoRouter.post('/primary', setServoAngle)
servoRouter.get('/primary', getServoAngle)



export default servoRouter;