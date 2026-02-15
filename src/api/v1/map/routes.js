import { Router } from 'express';
import { getMap } from './map.controller.js';

const mapRouter = Router();

//map routes
mapRouter.get('/map/', getMap);

export default mapRouter;
