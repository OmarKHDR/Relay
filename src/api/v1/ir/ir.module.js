import irRouter from '#modules/ir/routes.js';
import { irCallback } from '#modules/ir/wsIrCallback.js';

export const IrModule = {
    routers: [irRouter],
    WSCallback: [irCallback],
};
