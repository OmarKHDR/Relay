import { Router } from 'express';
import { smartHomeController } from './smart-home.controller.js';

const SmartHomeRoutes = Router();

// Device Discovery & Query
SmartHomeRoutes.get('/discover', smartHomeController.discover);
SmartHomeRoutes.get('/devices', smartHomeController.getAllDevices);
SmartHomeRoutes.get('/device', smartHomeController.getDev);
SmartHomeRoutes.get('/info', smartHomeController.getInfo);

// Device Control & Management
SmartHomeRoutes.post('/control', smartHomeController.control);
SmartHomeRoutes.post('/register', smartHomeController.registerDevice);
SmartHomeRoutes.post('/info', smartHomeController.updateDeviceInfo);

SmartHomeRoutes.delete('/devices/:deviceId', smartHomeController.deleteDevice);


SmartHomeRoutes.use('/smart-home', SmartHomeRoutes)

export { SmartHomeRoutes };
