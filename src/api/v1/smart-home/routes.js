import { Router } from 'express';
import { smartHomeController } from './smart-home.controller.js';

const SmartHomeRoutes = Router();

SmartHomeRoutes.get('/discover', smartHomeController.discover);
SmartHomeRoutes.get('/info', smartHomeController.getInfo);
SmartHomeRoutes.get('/status', smartHomeController.getStatus);
SmartHomeRoutes.post('/control', smartHomeController.control);

export { SmartHomeRoutes };
