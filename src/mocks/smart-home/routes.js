import { Router } from 'express';
import fs from 'fs';
import { controlDev, getInfo, getStatus } from './smart-dev.controller.js';
const mockSmartHomeRouter = Router();



mockSmartHomeRouter.get('/info', getInfo);

mockSmartHomeRouter.get('/status', getStatus);

mockSmartHomeRouter.post('/control', controlDev);

export default mockSmartHomeRouter;
