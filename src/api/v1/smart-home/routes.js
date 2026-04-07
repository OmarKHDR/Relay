import { Router } from 'express';
import { smartHomeController } from './smart-home.controller.js';

const SmartHomeRoutes = Router();

SmartHomeRoutes.get('/discover', smartHomeController.discover);

export default SmartHomeRoutes;
