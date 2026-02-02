import {Router} from 'express'
import { getServoAngle, setServoAngle } from "#modules/servo/servoController.js";

const servoApi = Router();


servoApi.post('/servo-motor/', setServoAngle);


servoApi.get('/servo-motor/', getServoAngle);


export default servoApi;