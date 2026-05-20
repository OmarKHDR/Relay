import { localDiscovery } from './discovery.udp.js';
import SmartHomeDevicesDB, { smartHomeDevicesDB } from './smart-home.db.js';
import logger from '#utils/logger.js';
import smartHomeRosTopic from './ros/smart-home.ros.topic.js';

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
        for (const [id, device] of Object.entries(discoveredDevices)) {
            if (!this.devices[id]) {
                const deviceToStore = { ...device, connected: true };
                await smartHomeDevicesDB.saveDevice(deviceToStore);
                this.devices[id] = deviceToStore;
                logger.info(`[SMART HOME] New device discovered: ${id}`);
                smartHomeRosTopic.publishDeviceEvent('NEW_DEVICE', deviceToStore);
                continue;
            }

            // Existing device: merge discovery data without overwriting stored metadata like position.
            const existing = this.devices[id];
            const merged = {
                ...existing,
                ...device,
                position: existing.position ?? device.position,
                name: existing.name ?? device.name,
                connected: true,
            };
            this.devices[id] = merged;
            await smartHomeDevicesDB.updateDeviceInfo({
                id,
                connected: true,
            });
        }
    }

    async discoverDeletedDevices(discoveredDevices) {
        for (const [id] of Object.entries(this.devices)) {
            if (!discoveredDevices[id]) {
                // Device exists in DB but not currently discovered: mark as disconnected (do not delete).
                if (this.devices[id]?.connected !== false) {
                    this.devices[id].connected = false;
                    await smartHomeDevicesDB.updateDeviceInfo({
                        id,
                        connected: false,
                    });
                    logger.info(`[SMART HOME] Device disconnected: ${id}`);
                    smartHomeRosTopic.publishDeviceEvent('DISCONNECTED', this.devices[id]);
                }
            }
        }
    }

    async discoverDevices(timeoutMs = 400) {
        const discoveredDevices = await localDiscovery.discoverDevices(timeoutMs);
        await this.discoverNewDevice(discoveredDevices);
        // Detect disconnected devices
        await this.discoverDeletedDevices(discoveredDevices);
        return this.devices;
    }

    async getDevInfo(id) {
        if (!this.devices[id]) throw new Error(`device doesn't currently exist on the network`);
        const device = this.devices[id];
        const response = await fetch(`http://${device.ip}:${SMART_DEV_PORT}/info?id=${id}`);
        const data = await response.json();
        return data;
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

    async controlDev(id, state) {
        if (!this.devices[id]) return false;

        const device = this.devices[id];
        state = this.validateState(state, device.controlType);
        const response = await fetch(`http://${device.ip}:${SMART_DEV_PORT}/control`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ state, id }),
        });

        await smartHomeDevicesDB.updateDeviceState(id, state);
        this.devices[id].state = state;

        smartHomeRosTopic.publishDeviceEvent('UPDATE', id, this.devices[id]);
        return this.devices[id];
    }

    getAllDevices() {
        return this.devices;
    }

    getDevice(id) {
        return this.devices[id];
    }

    async addDevice(device) {
        if (this.devices[device.id]) {
            logger.warn(`[SMART HOME] device ${device.id} already exist`);
            throw new Error(
                `trying to register a device that already exists device ID: ${device.id}`
            );
        }
        await smartHomeDevicesDB.addDevice(device);
        this.devices[device.id] = device;
        smartHomeRosTopic.publishDeviceEvent('ADD', device.id, device);
        return this.devices;
    }

    async updateDevice(device) {
        if (!this.devices[device.id]) {
            logger.warn(`[SMART HOME] device doesn't exist or undefined`);
            throw new Error(`trying to update a device that doesn't exit ${device.id}`);
        }
        const existingDevice = this.devices[device.id];
        if (device.name) {
            await fetch(`http://${existingDevice.ip}:${SMART_DEV_PORT}/name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: device.id,
                    name: device.name,
                }),
            });
        }
        await smartHomeDevicesDB.updateDeviceInfo(device);
        this.devices[device.id].name = device.name;
        smartHomeRosTopic.publishDeviceEvent('UPDATE', device.id, this.devices[device.id]);
        return this.devices[device.id];
    }

    async deleteDevice(id) {
        if (!id || !this.devices[id]) {
            logger.warn(`[SMART HOME] device ${id} doesn't exist`);
            throw new Error(`trying to delete device that doesn't exist device id: ${id}`);
        }
        const device = this.devices[id];

        try {
            const response = await fetch(
                `http://${device.ip}:${SMART_DEV_PORT}/factoryReset?id=${id}`,
                {
                    method: 'DELETE',
                }
            );
            logger.info(`[SMART HOME] Factory reset sent to device ${id}: ${response.status}`);
        } catch (fetchErr) {
            logger.warn(`[SMART HOME] Failed to send factory reset to device ${id}:`, fetchErr);
        }

        await smartHomeDevicesDB.deleteDevice(id);
        delete this.devices[id];
        smartHomeRosTopic.publishDeviceEvent('DISCONNECTED', id);
        return;
    }

    async changeDeviceRoom(id, roomId) {
        return await SmartHomeDevicesDB.updateRoom(id, roomId);
    }
}

export const smartHomeService = new SmartHomeService();
export default SmartHomeService;
