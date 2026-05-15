import { Router } from 'express';
import { getDevices, getDeviceById, deleteDevice } from './ir.controller.js';

const irRouter = Router();

irRouter.get('/ir/devices', getDevices);
irRouter.get('/ir/devices/:id', getDeviceById);
irRouter.delete('/ir/devices/:id', deleteDevice);

export default irRouter;
