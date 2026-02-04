import { Router } from 'express';
import { getMap } from '#modules/map/mapController.js';

const mapRouter = Router();

//map routes
mapRouter.get('/map/', getMap);

export default mapRouter;
