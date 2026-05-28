import { RosMount } from "./Ros.types";

declare global {
    namespace Express {
        interface Request {
            ros?: RosMount;
        }
    }
}

export {};
