import type { Routes } from './Routes.types.js';
import type { WSCallback } from './wsCallback.types.js';

export interface Module {
    routes?: Routes[];
    wsCallback?: WSCallback[];
    initialization?: Function[];
}
