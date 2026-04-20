import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
import { smartHomeService } from '../smart-home.service.js';

class SmartHomeRosService {
    constructor() {
        this.ros = null;
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[SMART HOME ROS SERVICE] ROS reconnected, refreshing services...');
            this.ros = newRosInstance;
            this.createServers();
        });
    }

    createServers() {
        this.createGetDevicesService();
        this.createDiscoveryService();
        this.createControlService();
        this.createDeviceInfoService();
        this.createRegisterDeviceService();
        this.createUpdateDeviceService();
        this.createDeleteDeviceService();
    }

    createGetDevicesService() {
        this.getAllDevicesService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/all_devices',
            serviceType: 'sanad_interfaces/srv/devices',
        });

        this.getAllDevicesService.advertise((request, response) => {
            logger.info(`[SMART HOME ROS] Received request to get all devices`);
            response.devices = smartHomeService.getAllDevices()
            return true;
        });
    }

    createDiscoveryService() {
        this.discoveryService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/discover',
            serviceType: 'sanad_interfaces/srv/discover',
        });

        this.discoveryService.advertise((request, response) => {
            logger.info(`[SMART HOME ROS] Received request to run broadcast discovery`);
            smartHomeService
                .discoverDevices()
                .then(res => {
                    response.success = true;
                    response.devices = Object.values(res);
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error returning devices to ros:`, err);
                    response.success = false;
                });
            return true;
        });
    }

    createControlService() {
        this.controlService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/control',
            serviceType: 'sanad_interfaces/srv/deviceControl',
        });

        this.controlService.advertise((request, response) => {
            logger.info(`[SMART HOME ROS] Received request to change device state`);
            smartHomeService
                .controlDev(request.deviceId, request.state)
                .then(() => {
                    response.success = true;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error returning devices to ros:`, err);
                    response.success = false;
                });
            return true;
        });
    }

    createDeviceInfoService() {
        this.deviceInfoService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/device',
            serviceType: 'sanad_interfaces/srv/device',
        });

        this.deviceInfoService.advertise((request, response) => {
            logger.info(
                `[SMART HOME ROS] Received request to get device info: deviceId: ${request.deviceId}`
            );
            smartHomeService
                .getDevInfo(request.deviceId)
                .then(res => {
                    response.success = true;
                    response.device = res;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error returning devices to ros:`, err);
                    response.success = false;
                });
            return true;
        });
    }

    createRegisterDeviceService() {
        this.registerDeviceService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/register_device',
            serviceType: 'sanad_interfaces/srv/device',
        });

        this.registerDeviceService.advertise((request, response) => {
            logger.info(
                `[SMART HOME ROS] Received request to register new device: deviceId: ${request.device.deviceId}`
            );
            smartHomeService
                .addDevice(request.device)
                .then(res => {
                    response.success = res;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error registering device via ros:`, err);
                    response.success = false;
                });
            return true;
        });
    }

    createUpdateDeviceService() {
        this.updateDeviceService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/update_device',
            serviceType: 'sanad_interfaces/srv/device',
        });

        this.updateDeviceService.advertise((request, response) => {
            logger.info(
                `[SMART HOME ROS] Received request to update device: deviceId: ${request.device.deviceId}`
            );
            smartHomeService
                .updateDevice(request.device)
                .then(res => {
                    response.success = res;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error updating device via ros:`, err);
                    response.success = false;
                });
            return true;
        });
    }

    createDeleteDeviceService() {
        this.deleteDeviceService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/delete_device',
            serviceType: 'sanad_interfaces/srv/device',
        });

        this.deleteDeviceService.advertise((request, response) => {
            logger.info(
                `[SMART HOME ROS] Received request to delete device: deviceId: ${request.deviceId}`
            );
            smartHomeService
                .deleteDevice(request.deviceId)
                .then(res => {
                    response.success = res;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error deleting device via ros:`, err);
                    response.success = false;
                });
            return true;
        });
    }
}

export const smartHomeRosService = new SmartHomeRosService();
export default SmartHomeRosService;
