import { Router } from 'express';
import { smartHomeController } from './smart-home.controller.js';

const SmartHomeRoutes = Router();

// Device Discovery & Query
SmartHomeRoutes.get('/discover', smartHomeController.discover);//done
SmartHomeRoutes.get('/devices', smartHomeController.getAllDevices);//done
SmartHomeRoutes.get('/info', smartHomeController.getInfo);//done
SmartHomeRoutes.get('/status', smartHomeController.getStatus);//done

// Device Control & Management
SmartHomeRoutes.post('/control', smartHomeController.control);//done
SmartHomeRoutes.post('/register', smartHomeController.registerDevice);//done
SmartHomeRoutes.put('/location', smartHomeController.updateDeviceLocation);//
SmartHomeRoutes.delete('/devices/:deviceId', smartHomeController.deleteDevice);

export { SmartHomeRoutes };
