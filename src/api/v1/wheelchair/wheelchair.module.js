import wheelchairRouter from '#modules/wheelchair/routes.js';
import { wheelchairCallback } from '#modules/wheelchair/wsWheelchairCallback.js';

export const WheelchairModule = {
    routers: [wheelchairRouter],
    WSCallback: [wheelchairCallback],
};
