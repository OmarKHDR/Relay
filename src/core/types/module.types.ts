import { Routes } from './Routes.types';
import { WSCallback } from './wsCallback.types';

export interface Module {
    routes?: Routes[];
    wsCallback?: WSCallback[];
    initialization?: Function[];
}
