import Router from "express";
import { getServoAngle, setServoAngle } from "#controllers/servoController.js";
const servoRouter = Router();


servoRouter.post('/', setServoAngle)
servoRouter.get('/', getServoAngle)



export default servoRouter;