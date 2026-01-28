import mapApi from '#modules/map/routes.js';
import servoApi from '#modules/servo/routes.js';
import ultrasonicApi from '#modules/ultrasonic/routes.js';
import wheelchairApi from '#modules/wheelchair/routes.js';
import poseApi from '#modules/pose/routes.js';

export const ApiRegistry = [mapApi, servoApi, ultrasonicApi, wheelchairApi, poseApi];
