import { Router } from 'express';
import { getMap } from '#modules/map/mapController.js';

const mapApi = Router();

//map routes
mapApi.get('/map/', getMap);

export default mapRouter;
