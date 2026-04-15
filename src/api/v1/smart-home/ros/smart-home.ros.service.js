import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
import { smartHomeService } from '../smart-home.service.js';
import { smartHomeDevicesDB } from '../smart-home.db.js';

class SmartHomeRosService {
    constructor() {
        this.ros = null;
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[SMART HOME ROS SERVICE] ROS reconnected, refreshing services...');
            this.ros = newRosInstance;
            this.createClients();
            this.createServers();
        });
    }

    // ============ CLIENTS (Node.js -> ROS) ============
    createClients() {
        this.deviceStatusClient = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/device_status',
            serviceType: 'sanad_interfaces/srv/DeviceStatus',
        });

        this.newDeviceClient = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/new_device',
            serviceType: 'sanad_interfaces/srv/NewDevice',
        });

        this.disconnectDeviceClient = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/disconnect_device',
            serviceType: 'sanad_interfaces/srv/DisconnectDevice',
        });
    }

    // ============ SERVERS (ROS -> Node.js) ============
    createServers() {
        // Server: Register Device (ROS calls this)
        this.registerDeviceServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/register_device',
            serviceType: 'sanad_interfaces/srv/RegisterDevice',
        });

        this.registerDeviceServer.advertise((request, response) => {
            logger.info(
                `[SMART HOME ROS] Received register device request for: ${request.device?.deviceId}`
            );
            smartHomeDevicesDB
                .addDevice(request.device)
                .then(() => {
                    response.success = true;
                    smartHomeService.devices[request.device.deviceId] = request.device;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error registering device:`, err);
                    response.success = false;
                });
            return true;
        });

        // Server: Delete Device (ROS calls this)
        this.deleteDeviceServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/delete_device',
            serviceType: 'sanad_interfaces/srv/DeleteDevice',
        });

        this.deleteDeviceServer.advertise((request, response) => {
            logger.info(`[SMART HOME ROS] Received delete device request for: ${request.id}`);
            smartHomeDevicesDB
                .deleteDevice(request.id)
                .then(() => {
                    response.success = true;
                    delete smartHomeService.devices[request.id];
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error deleting device:`, err);
                    response.success = false;
                });
            return true;
        });

        // Server: Get All Devices (ROS calls this)
        this.getAllDevicesServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/get_all_devices',
            serviceType: 'sanad_interfaces/srv/GetAllDevices',
        });

        this.getAllDevicesServer.advertise((request, response) => {
            logger.info(`[SMART HOME ROS] Retrieving all devices`);
            response.success = true;
            response.devices = Object.values(smartHomeService.devices);
            return true;
        });

        // Server: Update Device Location (ROS calls this)
        this.updateDeviceLocationServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/update_device_location',
            serviceType: 'sanad_interfaces/srv/UpdateDeviceLocation',
        });

        this.updateDeviceLocationServer.advertise((request, response) => {
            const { deviceId, location } = request;
            logger.info(`[SMART HOME ROS] Updating device location: ${deviceId} -> ${location}`);
            smartHomeDevicesDB
                .updateDevice({
                    deviceId,
                    position: location,
                    lastUpdated: new Date().toISOString(),
                })
                .then(() => {
                    response.success = true;
                    smartHomeService.devices[deviceId].position = location;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error updating device location:`, err);
                    response.success = false;
                });
            return true;
        });

        // Server: Control Device (ROS calls this)
        this.controlServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/control',
            serviceType: 'sanad_interfaces/srv/ControlDevice',
        });

        this.controlServer.advertise((request, response) => {
            const { deviceId, state } = request;
            logger.info(
                `[SMART HOME ROS] Received control request for device: ${deviceId}, state: ${state}`
            );
            smartHomeService
                .controlDev(deviceId, state)
                .then(res => {
                    response.success = res && res.ok ? true : false;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error controlling device:`, err);
                    response.success = false;
                });
            return true;
        });

        // Server: Get Device Status (ROS calls this)
        this.statusServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/status',
            serviceType: 'sanad_interfaces/srv/GetDeviceStatus',
        });

        this.statusServer.advertise((request, response) => {
            const { deviceId } = request;
            smartHomeService
                .getDevStatus(deviceId)
                .then(async res => {
                    if (res && res.ok) {
                        const data = await res.json().catch(() => null);
                        response.success = true;
                        response.state = data?.state || 0;
                    } else {
                        response.success = false;
                    }
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error getting device status:`, err);
                    response.success = false;
                });
            return true;
        });

        // Server: Get Device Info (ROS calls this)
        this.infoServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/info',
            serviceType: 'sanad_interfaces/srv/GetDeviceInfo',
        });

        this.infoServer.advertise((request, response) => {
            const { deviceId } = request;
            const device = smartHomeService.devices[deviceId];
            if (device) {
                response.success = true;
                response.device = {
                    deviceId: device.deviceId,
                    name: device.deviceName || '',
                    type: device.controlType || '',
                    ip: device.ip || '',
                    state: device.state || 0,
                };
            } else {
                response.success = false;
            }
            return true;
        });

        // Server: Discover Devices (ROS calls this)
        this.discoverServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/discover',
            serviceType: 'sanad_interfaces/srv/DiscoverDevices',
        });

        this.discoverServer.advertise((request, response) => {
            const timeoutMs = request.timeout_ms || 4000;
            smartHomeService
                .discoverDevices(timeoutMs < 10000 && timeoutMs > 0 ? timeoutMs : 4000)
                .then(devices => {
                    response.success = true;
                    response.devices = Object.values(devices);
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error discovering devices:`, err);
                    response.success = false;
                });
            return true;
        });
    }

    // ============ CLIENT NOTIFICATION METHODS ============
    async notifyDeviceStatus(deviceId, statusData) {
        if (!this.deviceStatusClient) {
            logger.warn('[SMART HOME ROS] Device status client not ready');
            return;
        }
        const request = new ROSLIB.ServiceRequest({
            deviceId: deviceId,
            state: statusData.state || 0,
            timestamp: new Date().toISOString(),
        });
        this.deviceStatusClient.callService(
            request,
            result => {
                logger.info(`[SMART HOME ROS] Device status notification sent for ${deviceId}`);
            },
            err => {
                logger.error(`[SMART HOME ROS] Error notifying device status:`, err);
            }
        );
    }

    async notifyNewDevice(deviceId, device) {
        if (!this.newDeviceClient) {
            logger.warn('[SMART HOME ROS] New device client not ready');
            return;
        }
        const request = new ROSLIB.ServiceRequest({
            deviceId: deviceId,
            deviceName: device.deviceName || '',
            deviceType: device.controlType || '',
            ip: device.ip || '',
        });
        this.newDeviceClient.callService(
            request,
            result => {
                logger.info(`[SMART HOME ROS] New device notification sent for ${deviceId}`);
            },
            err => {
                logger.error(`[SMART HOME ROS] Error notifying new device:`, err);
            }
        );
    }

    async notifyDisconnectDevice(deviceId) {
        if (!this.disconnectDeviceClient) {
            logger.warn('[SMART HOME ROS] Disconnect device client not ready');
            return;
        }
        const request = new ROSLIB.ServiceRequest({
            deviceId,
        });
        this.disconnectDeviceClient.callService(
            request,
            result => {
                logger.info(`[SMART HOME ROS] Device disconnect notification sent for ${deviceId}`);
            },
            err => {
                logger.error(`[SMART HOME ROS] Error notifying device disconnect:`, err);
            }
        );
    }

    async registerDevice(deviceObj, roomName = '') {
        return new Promise((resolve, reject) => {
            if (!this.registerDeviceServer) {
                return reject(new Error('ROS not connected'));
            }
            logger.info(
                `[SMART HOME ROS] Registering device ${deviceObj.deviceId} in room ${roomName}`
            );
            resolve(true);
        });
    }

    async deleteDevice(deviceId) {
        return new Promise((resolve, reject) => {
            if (!this.deleteDeviceServer) {
                return reject(new Error('ROS not connected'));
            }
            logger.info(`[SMART HOME ROS] Deleting device ${deviceId}`);
            resolve(true);
        });
    }

    async getAllDevices() {
        return new Promise((resolve, reject) => {
            if (!this.getAllDevicesServer) {
                return reject(new Error('ROS not connected'));
            }
            resolve(Object.values(smartHomeService.devices));
        });
    }
}

export const smartHomeRosService = new SmartHomeRosService();
export default SmartHomeRosService;
