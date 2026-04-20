import wheelchairRouter from '#modules/wheelchair/routes.js';
import { wheelchairCallback } from '#modules/wheelchair/wsWheelchairCallback.js';
import './ros/wheelchairTopic.js';

export const WheelchairModule = {
    routers: [wheelchairRouter],
    WSCallback: [wheelchairCallback],
};
