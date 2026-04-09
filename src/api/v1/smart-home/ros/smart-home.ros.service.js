import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
import { smartHomeService } from '../smart-home.service.js';

// actual workflow
// devices exist on network, server broadcasts, devices respond, Server builds the actual device db 
//   
//
// TODO:
// fix: GetAllDevices -> ros is getting the found devices not the server
//                          though the server will send devices through a request with the body as all the devices in json format
//                          ros returns success on recieving the request that is valid
// 
class SmartHomeRosService {
    constructor() {
        rosHandler.on('ros_reconnected', (newRosInstance) => {
            logger.info('[SMART HOME ROS SERVICE] ROS reconnected, refreshing services...');
            this.ros = newRosInstance;
            this.createClients();
            this.createServers();
        });
    }

    createClients() {
        // ROS Server: ROS System
        // ROS Client: Node.js (this service)
        
        // 
        this.registerDeviceClient = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/register_device',
            serviceType: 'sanad_interfaces/srv/RegisterDevice',
        });

        // how sends the delete? server sends delete device on disconnect and ros finds it and gray it out
        this.deleteDeviceClient = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/delete_device',
            serviceType: 'sanad_interfaces/srv/DeleteDevice',
        });

        // to be fixed
        this.getAllDevicesClient = new ROSLIB.Service({
            ros: this.ros,
            name: '/sanad/smart_home/get_all_devices',
            serviceType: 'sanad_interfaces/srv/GetAllDevices',
        });
    }

    createServers() {
        // ROS Server: Node.js (this service)
        // ROS Client: ROS System
        
        this.controlServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/control',
            serviceType: 'sanad_interfaces/srv/ControlDevice' // Assuming
        });

        this.controlServer.advertise((request, response) => {
            const { deviceId, state } = request;
            logger.info(`[SMART HOME ROS] Received control request for device: ${deviceId}, state: ${state}`);
            smartHomeService.controlDev(deviceId, state)
                .then(res => {
                    response.success = res && res.ok ? true : false;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error controlling device: ${err}`);
                    response.success = false;
                });
            return true;
        });

        this.statusServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/status',
            serviceType: 'sanad_interfaces/srv/GetDeviceStatus' // Assuming
        });

        this.statusServer.advertise((request, response) => {
            const { deviceId } = request;
            smartHomeService.getDevStatus(deviceId)
                .then(async res => {
                    if (res && res.ok) {
                        const data = await res.json().catch(() => null);
                        response.success = true;
                        response.state = data ? data.state : 0; // Adjust mapping based on actual response
                    } else {
                        response.success = false;
                    }
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error getting device status: ${err}`);
                    response.success = false;
                });
            return true;
        });

        this.infoServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/info',
            serviceType: 'sanad_interfaces/srv/GetDeviceInfo' // Assuming
        });

        this.infoServer.advertise((request, response) => {
            const { deviceId } = request;
            const device = smartHomeService.devices[deviceId];
            if (device) {
                response.success = true;
                response.device = {
                    id: device.deviceId,
                    name: device.deviceName || '',
                    type: device.controlType || '',
                    action: [], // Map as needed from your device object
                    state_keys: [], // Map as needed
                    state_values: [] // Map as needed
                };
            } else {
                response.success = false;
            }
            return true;
        });

        this.discoverServer = new ROSLIB.Service({
            ros: this.ros,
            name: '/smart_home/discover',
            serviceType: 'sanad_interfaces/srv/DiscoverDevices' // Assuming
        });

        this.discoverServer.advertise((request, response) => {
            const timeoutMs = request.timeout_ms || 4000;
            smartHomeService.discoverDevices(timeoutMs < 10000 && timeoutMs > 0 ? timeoutMs : 4000)
                .then(devices => {
                    response.success = true;
                })
                .catch(err => {
                    logger.error(`[SMART HOME ROS] Error discovering devices: ${err}`);
                    response.success = false;
                });
            return true;
        });
    }

    // Call ROS Services
    async registerDevice(deviceObj, roomName = '') {
        return new Promise((resolve, reject) => {
            if (!this.registerDeviceClient) {
                return reject(new Error("ROS not connected"));
            }
            const request = new ROSLIB.ServiceRequest({
                device: {
                    id: deviceObj.deviceId || '',
                    name: deviceObj.deviceName || '',
                    type: deviceObj.controlType || '',
                    action: [],
                    state_keys: ['state'],
                    state_values: [deviceObj.state?.toString() || '0']
                },
                room_name: roomName
            });
            this.registerDeviceClient.callService(request, (result) => {
                resolve(result.success);
            }, (err) => {
                reject(err);
            });
        });
    }

    async deleteDevice(deviceId) {
        return new Promise((resolve, reject) => {
            if (!this.deleteDeviceClient) {
                return reject(new Error("ROS not connected"));
            }
            const request = new ROSLIB.ServiceRequest({
                id: deviceId
            });
            this.deleteDeviceClient.callService(request, (result) => {
                resolve(result.success);
            }, (err) => {
                reject(err);
            });
        });
    }

    async getAllDevices() {
        return new Promise((resolve, reject) => {
            if (!this.getAllDevicesClient) {
                return reject(new Error("ROS not connected"));
            }
            const request = new ROSLIB.ServiceRequest({});
            this.getAllDevicesClient.callService(request, (result) => {
                resolve(result); // Assuming result contains an array of devices
            }, (err) => {
                reject(err);
            });
        });
    }
}

export const smartHomeRosService = new SmartHomeRosService();
export default SmartHomeRosService;
