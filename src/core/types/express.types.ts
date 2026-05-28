import type { RosMount } from './Ros.types.js';

declare global {
    namespace Express {
        interface Request {
            ros?: RosMount;
        }
    }
}

export {};
