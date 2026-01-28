import Router from 'express'
import { getDistance } from "#mpodules/ultrasonic/ultrasonicController.js";

const ultrasonicApi = Router();


// ultrasonic
ultrasonicApi.get('/sensors/ultrasonic/', getDistance);


export default ultrasonicApi;