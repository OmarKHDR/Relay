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

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.createServers();
        }
    }

    createServers() {
        this.createGetDevicesService();
        this.createDiscoveryService();
        this.createControlService();
        this.createDeviceService();
        this.createDeviceInfoService();
        this.createRegisterDeviceService();
        this.createUpdateDeviceService();
        this.createDeleteDeviceService();
    }

    getRequestDeviceId(request) {
        return request?.device_id ?? request?.deviceId ?? null;
    }

    parseDevicePayload(request) {
        const payload = request?.device;
        if (!payload) return null;
        if (typeof payload === 'string') {
            try {
                return JSON.parse(payload);
            } catch {
                return null;
            }
        }
        return payload;
    }

    createGetDevicesService() {
        this.getAllDevicesService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/all_devices',
            serviceType: 'sanad_interfaces/srv/Devices',
        });

        this.getAllDevicesService.advertise((request, response) => {
            logger.info(`[SMART HOME ROS] Received request to get all devices`);
            response.success = true;
            response.devices = JSON.stringify(smartHomeService.getAllDevices());
            return true;
        });
    }

    createDiscoveryService() {
        this.discoveryService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/discover',
            serviceType: 'sanad_interfaces/srv/Discover',
        });

        this.discoveryService.advertise((request, response) => {
            logger.info(`[SMART HOME ROS] Received request to run broadcast discovery`);
            smartHomeService
                .discoverDevices()
                .then(res => {
                    response.success = true;
                    response.devices = JSON.stringify(res);
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error returning devices to ros:`, err);
                    response.success = false;
                    response.devices = '{}';
                });
            return true;
        });
    }

    createControlService() {
        this.controlService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/control',
            serviceType: 'sanad_interfaces/srv/DeviceControl',
        });

        this.controlService.advertise((request, response) => {
            const deviceId = this.getRequestDeviceId(request);
            logger.info(`[SMART HOME ROS] Received request to change device state`);
            smartHomeService
                .controlDev(deviceId, request.state)
                .then(success => {
                    response.success = success;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error returning devices to ros:`, err);
                    response.success = false;
                });
            return true;
        });
    }

    createDeviceService() {
        this.deviceService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/device',
            serviceType: 'sanad_interfaces/srv/Device',
        });

        this.deviceService.advertise((request, response) => {
            logger.info(
                `[SMART HOME ROS] Received request to get device from DB: deviceId: ${this.getRequestDeviceId(request)}`
            );
            const deviceId = this.getRequestDeviceId(request);
            const device = smartHomeService.getDevice(deviceId);
            response.success = Boolean(device);
            response.device = JSON.stringify(device || {});
            return true;
        });
    }

    createDeviceInfoService() {
        this.deviceInfoService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/device_info',
            serviceType: 'sanad_interfaces/srv/Device',
        });

        this.deviceInfoService.advertise((request, response) => {
            const deviceId = this.getRequestDeviceId(request);
            logger.info(
                `[SMART HOME ROS] Received request to get runtime device info: deviceId: ${deviceId}`
            );
            smartHomeService
                .getDevInfo(deviceId)
                .then(res => {
                    response.success = true;
                    response.device = JSON.stringify(res || {});
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error returning device info to ros:`, err);
                    response.success = false;
                    response.device = '{}';
                });
            return true;
        });
    }

    createRegisterDeviceService() {
        this.registerDeviceService = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/register_device',
            serviceType: 'sanad_interfaces/srv/Device',
        });

        this.registerDeviceService.advertise((request, response) => {
            const device = this.parseDevicePayload(request);
            logger.info(
                `[SMART HOME ROS] Received request to register new device: deviceId: ${device?.deviceId}`
            );
            smartHomeService
                .addDevice(device)
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
            serviceType: 'sanad_interfaces/srv/Device',
        });

        this.updateDeviceService.advertise((request, response) => {
            const device = this.parseDevicePayload(request);
            logger.info(
                `[SMART HOME ROS] Received request to update device: deviceId: ${device?.deviceId}`
            );
            smartHomeService
                .updateDevice(device)
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
            serviceType: 'sanad_interfaces/srv/Device',
        });

        this.deleteDeviceService.advertise((request, response) => {
            const deviceId = this.getRequestDeviceId(request);
            logger.info(
                `[SMART HOME ROS] Received request to delete device: deviceId: ${deviceId}`
            );
            smartHomeService
                .deleteDevice(deviceId)
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
