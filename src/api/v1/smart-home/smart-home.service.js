import { localDiscovery } from './discovery.udp.js';
import { smartHomeDevicesDB } from './smart-home.db.js';
import logger from '#utils/logger.js';

const SMART_DEV_PORT = process.env.SMART_DEV_PORT;
class SmartHomeService {
    constructor() {
        this.devices = {};
        this.previousDevices = {};
        this.initializeDB();
    }

    async initializeDB() {
        try {
            this.devices = await smartHomeDevicesDB.getDb();
            // On server start, default all devices to disconnected until a discovery run confirms presence.
            for (const dev of Object.values(this.devices)) {
                dev.connected = false;
            }
            // taking a copy of initialization for future comp to identify changes
            this.previousDevices = { ...this.devices };
        } catch (err) {
            logger.error(`[SMART HOME] Failed to initialize DB:`, err);
        }
    }

    async discoverNewDevice(discoveredDevices) {
        for (const [deviceId, device] of Object.entries(discoveredDevices)) {
            if (!this.devices[deviceId]) {
                const deviceToStore = { ...device, connected: true };
                await smartHomeDevicesDB.saveDevice(deviceToStore);
                this.devices[deviceId] = deviceToStore;
                logger.info(`[SMART HOME] New device discovered: ${deviceId}`);
                smartHomeRosTopic.publishDeviceEvent('ADD', deviceId, deviceToStore);
                continue;
            }

            // Existing device: merge discovery data without overwriting stored metadata like position.
            const existing = this.devices[deviceId];
            const merged = {
                ...existing,
                ...device,
                position: existing.position ?? device.position,
                name: existing.name ?? device.name,
                connected: true,
            };
            this.devices[deviceId] = merged;
            await smartHomeDevicesDB.updateDeviceInfo({
                deviceId,
                connected: true,
            });
        }
    }

    async discoverDeletedDevices(discoveredDevices) {
        for (const [deviceId] of Object.entries(this.devices)) {
            if (!discoveredDevices[deviceId]) {
                // Device exists in DB but not currently discovered: mark as disconnected (do not delete).
                if (this.devices[deviceId]?.connected !== false) {
                    this.devices[deviceId].connected = false;
                    await smartHomeDevicesDB.updateDeviceInfo({
                        deviceId,
                        connected: false,
                    });
                    logger.info(`[SMART HOME] Device disconnected: ${deviceId}`);
                    smartHomeRosTopic.publishDeviceEvent('DISCONNECT', deviceId);
                }
            }
        }
    }

    async discoverDevices(timeoutMs = 400) {
        try {
            const discoveredDevices = await localDiscovery.discoverDevices(timeoutMs);

            // Detect new devices
            await this.discoverNewDevice(discoveredDevices);
            // Detect disconnected devices
            await this.discoverDeletedDevices(discoveredDevices);
            return this.devices;
        } catch (err) {
            logger.error(`[SMART HOME] Error running discovery`, err);
            throw err;
        }
    }

    async getDevInfo(deviceId) {
        if (!this.devices[deviceId])
            throw new Error(`device doesn't currently exist on the network`);

        try {
            const device = this.devices[deviceId];
            const response = await fetch(
                `http://${device.ip}:${SMART_DEV_PORT}/info?deviceId=${deviceId}`
            );
            const data = await response.json();
            return data;
        } catch (err) {
            logger.error(`[SMART HOME] Error getting status for device ${deviceId}:`, err);
            throw err;
        }
    }

    validateState(state, controlType) {
        switch (controlType) {
            case 'binary':
                if (Number(state) === 0 || Number(state) === 1) return Number(state);
                else
                    throw new Error(
                        `state: ${state} doesn't match device controlType: ${controlType}`
                    );
            default:
                throw new Error(`this device ControlType is not implemented yet`);
        }
    }

    async controlDev(deviceId, state) {
        if (!this.devices[deviceId]) return false;
        try {
            const device = this.devices[deviceId];
            state = this.validateState(state, device.controlType);
            const response = await fetch(`http://${device.ip}:${SMART_DEV_PORT}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state, deviceId }),
            });

            await smartHomeDevicesDB.updateDeviceState(deviceId, state);
            this.devices[deviceId].state = state;

            smartHomeRosTopic.publishDeviceEvent('UPDATE', deviceId, this.devices[deviceId]);
            return true;
        } catch (err) {
            logger.error(`[SMART HOME] Error controlling device ${deviceId}:`, err);
            return false;
        }
    }

    getAllDevices() {
        return this.devices;
    }

    getDevice(deviceId) {
        return this.devices[deviceId];
    }

    async addDevice(device) {
        try {
            if (device && device.deviceId && this.devices[device.deviceId]) {
                logger.warn(`[SMART HOME] device ${device.deviceId} already exist`);
                return false;
            }
            await smartHomeDevicesDB.addDevice(device);
            this.devices[device.deviceId] = device;
            smartHomeRosTopic.publishDeviceEvent('ADD', device.deviceId, device);
            return true;
        } catch (err) {
            logger.error(`[SMART HOME] error registering new device ${device?.deviceId}: ${err}`);
            return false;
        }
    }

    async updateDevice(device) {
        try {
            if (!device || !device.deviceId || !this.devices[device.deviceId]) {
                logger.warn(`[SMART HOME] device doesn't exist or undefined`);
                return false;
            }
            const existingDevice = this.devices[device.deviceId];
            if (device.name) {
                await fetch(`http://${existingDevice.ip}:${SMART_DEV_PORT}/name`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        deviceId: device.deviceId,
                        name: device.name,
                    }),
                });
            }
            await smartHomeDevicesDB.updateDeviceInfo(device);
            this.devices[device.deviceId] = { ...this.devices[device.deviceId], ...device };
            smartHomeRosTopic.publishDeviceEvent(
                'UPDATE',
                device.deviceId,
                this.devices[device.deviceId]
            );
            return true;
        } catch (err) {
            logger.error(`[SMART HOME] error updating device ${device?.deviceId}: ${err}`);
            return false;
        }
    }

    async deleteDevice(deviceId) {
        try {
            if (!deviceId || !this.devices[deviceId]) {
                logger.warn(`[SMART HOME] device ${deviceId} doesn't exist`);
                return false;
            }
            const device = this.devices[deviceId];

            try {
                const response = await fetch(
                    `http://${device.ip}:${SMART_DEV_PORT}/factoryReset?deviceId=${deviceId}`,
                    {
                        method: 'DELETE',
                    }
                );
                logger.info(
                    `[SMART HOME] Factory reset sent to device ${deviceId}: ${response.status}`
                );
            } catch (fetchErr) {
                logger.warn(
                    `[SMART HOME] Failed to send factory reset to device ${deviceId}:`,
                    fetchErr
                );
            }

            await smartHomeDevicesDB.deleteDevice(deviceId);
            delete this.devices[deviceId];
            smartHomeRosTopic.publishDeviceEvent('DELETE', deviceId);
            return true;
        } catch (err) {
            logger.error(`[SMART HOME] error deleting device ${deviceId}: ${err}`);
            return false;
        }
    }
}

export const smartHomeService = new SmartHomeService();
export default SmartHomeService;
