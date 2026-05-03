import logger from '#utils/logger.js';
import fs from 'fs/promises';

class SmartHomeDevicesDB {
    constructor() {
        this.devices = {};
        this.dbPath = `./src/api/v1/smart-home/smart-home.db.json`;
    }

    async readDbContent() {
        try {
            const content = await fs.readFile(this.dbPath, 'utf-8');
            this.devices = JSON.parse(content);
            return this.devices;
        } catch (err) {
            logger.warn(`[SMART HOME DB] Failed to read DB, initializing empty:`, err.message);
            this.devices = {};
            return this.devices;
        }
    }

    async saveToDb() {
        try {
            await fs.writeFile(this.dbPath, JSON.stringify(this.devices, null, 2));
        } catch (err) {
            logger.error(`[SMART HOME DB] Failed to save DB:`, err);
            throw err;
        }
    }

    async getDb() {
        return await this.readDbContent();
    }

    async addDevice(device) {
        if (this.devices[device.deviceId]) {
            logger.warn(`[SMART HOME DB] Device ${device.deviceId} already exists`);
            return 1; // Device already exists
        }
        this.devices[device.deviceId] = device;
        await this.saveToDb();
        logger.info(`[SMART HOME DB] Added device: ${device.deviceId}`);
        return 0; // Success
    }

    async updateDeviceState(deviceId, state) {
        if (!this.devices[deviceId]) {
            logger.error(`[SMART HOME DB] Device ${deviceId} doesn't exist`);
            throw new Error('Device does not exist');
        }
        this.devices[deviceId].state = state;
        await this.saveToDb();
        logger.info(`[SMART HOME DB] Updated device: ${deviceId}`);
    }

    async updateDeviceConnectionState(deviceId, connectionState) {
        if (!this.devices[deviceId]) {
            logger.error(`[SMART HOME DB] Device ${deviceId} doesn't exist`);
            throw new Error('Device does not exist');
        }
        this.devices[deviceId].connectionState = Boolean(connectionState);
        await this.saveToDb();
        logger.info(`[SMART HOME DB] Updated device connectionState: ${deviceId}`);
    }

    async updateDeviceInfo(device) {
        if (!this.devices[device.deviceId]) {
            logger.error(`[SMART HOME DB] Device ${device.deviceId} doesn't exist`);
            throw new Error('Device does not exist');
        }
        device = this.validateUpdate(device);
        this.devices[device.deviceId] = { ...this.devices[device.deviceId], ...device };
        await this.saveToDb();
        logger.info(`[SMART HOME DB] Updated device: ${device.deviceId}`);
    }

    validateUpdate(device) {
        const keys = Object.keys(device);
        //keys must only contain (position or/and name) and deviceId
        const { deviceId, position, name, connectionState } = device;
        if (!deviceId || (position === undefined && name === undefined && connectionState === undefined))
            throw new Error(
                `data is not enough to update device:${deviceId}, Position: ${position}, name: ${name}, connectionState: ${connectionState}`
            );
        const data = {}
        if (deviceId) data.deviceId = deviceId;
        if (position !== undefined) data.position = position;
        if (name !== undefined) data.name = name;
        if (connectionState !== undefined) data.connectionState = Boolean(connectionState);
        return data;
    }
    async deleteDevice(deviceId) {
        if (this.devices[deviceId]) {
            delete this.devices[deviceId];
            await this.saveToDb();
            logger.info(`[SMART HOME DB] Deleted device: ${deviceId}`);
        } else {
            logger.error(`[SMART HOME DB] Device ${deviceId} doesn't exist`);
            throw new Error('Device does not exist');
        }
    }
}

export const smartHomeDevicesDB = new SmartHomeDevicesDB();
export default SmartHomeDevicesDB;
