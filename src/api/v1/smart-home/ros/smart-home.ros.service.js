import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
import { smartHomeService } from '../smart-home.service.js';

const mapToRosDevice = (dev = {}) => ({
    id: dev.id || '',
    name: dev.name || '',
    control_type: dev.controlType || dev.control_type || '',
    state: Number(dev.state) || 0,
    connected: Boolean(dev.connected),
    created_at: dev.createdAt ? String(dev.createdAt) : '',
    updated_at: dev.updatedAt ? String(dev.updatedAt) : '',
});

class SmartHomeService {
    constructor() {
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[SmartHome] ROS reconnected, refreshing subscription...');
            this.ros = newRosInstance;
            this.createService();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.createService();
        }
    }

    createService() {
        this.getAllDevices = new ROSLIB.Service({
            ros: this.ros,
            name: '/smarthome/getAllDevices',
            serviceType: 'sanad_interfaces/srv/GetAllDevices',
        });
        this.getAllDevices.advertise(this.getAllDevicesCallback.bind(this));

        this.deleteDevice = new ROSLIB.Service({
            ros: this.ros,
            name: '/smarthome/deleteDevices',
            serviceType: 'sanad_interfaces/srv/DeleteDevice',
        });
        this.deleteDevice.advertise(this.deleteDeviceCallback.bind(this));

        this.getDevice = new ROSLIB.Service({
            ros: this.ros,
            name: '/smarthome/getDevices',
            serviceType: 'sanad_interfaces/srv/GetDevice',
        });
        this.getDevice.advertise(this.getDeviceCallback.bind(this));

        this.registerDevice = new ROSLIB.Service({
            ros: this.ros,
            name: '/smarthome/registerDevice',
            serviceType: 'sanad_interfaces/srv/RegisterDevice',
        });
        this.registerDevice.advertise(this.registerDeviceCallback.bind(this));
    }

    async getAllDevicesCallback(req, res) {
        const devices = await smartHomeService.getAllDevices();
        res.devices = Object.values(devices).map(mapToRosDevice);
        return true;
    }

    async deleteDeviceCallback(req, res) {
        await smartHomeService.deleteDevice(req.id);
        res.success = true;
        return true;
    }

    async getDeviceCallback(req, res) {
        const dev = await smartHomeService.getDevice(req.id);
        res.device = dev ? mapToRosDevice(dev) : mapToRosDevice({});
        return true;
    }

    async registerDeviceCallback(req, res) {
        const devMsg = req.device;
        const device = {
            id: devMsg.id,
            name: devMsg.name,
            controlType: devMsg.control_type,
            state: devMsg.state,
            connected: devMsg.connected,
            createdAt: devMsg.created_at,
            updatedAt: devMsg.updated_at,
        };
        await smartHomeService.addDevice(device);
        res.success = true;
        return true;
    }

}

export default new SmartHomeService();
