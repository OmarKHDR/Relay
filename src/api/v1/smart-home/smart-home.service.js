import { localDiscovery } from './discovery.udp.js';
import { smartHomeRosService } from './ros/smart-home.ros.service.js';
import { smartHomeDevicesDB } from './smart-home.db.js';
import logger from '#utils/logger.js';

class SmartHomeService {
    constructor() {
        this.devices = {};
        this.previousDevices = {};
        this.initializeDB();
    }

    async initializeDB() {
        try {
            this.devices = await smartHomeDevicesDB.getDb();
            this.previousDevices = { ...this.devices };
        } catch (err) {
            logger.error(`[SMART HOME] Failed to initialize DB:`, err);
        }
    }

    async discoverDevices(timeoutMs = 400) {
        const discoveredDevices = await localDiscovery.discoverDevices(timeoutMs);

        // Detect new devices
        for (const [deviceId, device] of Object.entries(discoveredDevices)) {
            if (!this.devices[deviceId]) {
                try {
                    await smartHomeDevicesDB.addDevice(device);
                    this.devices[deviceId] = device;
                    logger.info(`[SMART HOME] New device discovered: ${deviceId}`);
                    await smartHomeRosService.notifyNewDevice(deviceId, device);
                } catch (err) {
                    logger.error(`[SMART HOME] Failed to add new device ${deviceId}:`, err);
                }
            }
        }

        // Detect disconnected devices
        for (const [deviceId, device] of Object.entries(this.devices)) {
            if (!discoveredDevices[deviceId]) {
                try {
                    await smartHomeDevicesDB.deleteDevice(deviceId);
                    delete this.devices[deviceId];
                    logger.info(`[SMART HOME] Device disconnected: ${deviceId}`);
                    await smartHomeRosService.notifyDisconnectDevice(deviceId);
                } catch (err) {
                    logger.error(`[SMART HOME] Failed to remove device ${deviceId}:`, err);
                }
            }
        }

        // Register newly discovered devices with ROS
        for (const [deviceId, device] of Object.entries(discoveredDevices)) {
            if (!this.previousDevices[deviceId]) {
                try {
                    const roomName = device.position || device.room || '';
                    await smartHomeRosService.registerDevice(device, roomName);
                } catch (err) {
                    logger.error(
                        `[SMART HOME] Failed to register device ${deviceId} with ROS:`,
                        err
                    );
                }
            }
        }

        this.previousDevices = { ...this.devices };
        return this.devices;
    }

    async getDevStatus(deviceId) {
        if (!this.devices[deviceId]) return;

        try {
            const device = this.devices[deviceId];
            console.log(device);
            const response = await fetch(`http://${device.ip}:${device.port || 8080}/status`);
            const data = await response.json();
            console.log('status: ', data);
            // if (data) {
            //     await smartHomeRosService.notifyDeviceStatus(deviceId, data);
            // }
            return data;
        } catch (err) {
            logger.error(`[SMART HOME] Error getting status for device ${deviceId}:`, err);
        }
        return null;
    }

    async controlDev(deviceId, state) {
        if (!this.devices[deviceId]) return null;

        try {
            const device = this.devices[deviceId];
            const response = await fetch(`http://${device.ip}:${device.port || 8080}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state, deviceId }),
            });

            const data = await response.json();
            // await smartHomeRosService.notifyDeviceStatus(deviceId, { state });
            await smartHomeDevicesDB.updateDevice({
                deviceId,
                state,
                lastUpdated: new Date().toISOString(),
            });
            return data;
        } catch (err) {
            logger.error(`[SMART HOME] Error controlling device ${deviceId}:`, err);
        }
        return null;
    }
}

export const smartHomeService = new SmartHomeService();
export default SmartHomeService;
