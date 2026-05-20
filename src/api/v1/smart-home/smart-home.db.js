import logger from '#utils/logger.js';
import { dbRepositories } from '#src/db/db.repositories.js';

class SmartHomeDevicesDB {
    constructor() {
        this.devices = {};
        this.devicesDb = dbRepositories.device;
    }

    async readDbContent() {
        try {
            const devicesArr = await this.devicesDb.find({});
            this.devices = {};
            for (const dev of devicesArr) {
                this.devices[dev.id] = dev;
            }
            return this.devices;
        } catch (err) {
            logger.warn(`[SMART HOME DB] Failed to read DB, initializing empty:`, err.message);
            this.devices = {};
            return this.devices;
        }
    }

    async getDb() {
        return await this.readDbContent();
    }

    async saveDevice(device) {
        const id = device.deviceId || device.id;
        if (device.roomName) {
            const room = await dbRepositories.room.findOne({ name: device.roomName });
            if (!room) {
                throw new Error(`room ${device.roomName} doesn't exist`);
            }
            device.roomId = room.id;
        }
        const fullDevice = {
            ...device,
            id,
            connected: device.connected ?? false,
            created_at: device.created_at ?? new Date(),
            updated_at: new Date(),
            room: device.roomId ? { id: device.roomId } : undefined,
        };
        await this.devicesDb.save(fullDevice);
        this.devices[id] = fullDevice;
        logger.info(`[SMART HOME DB] Saved device: ${id}`);
    }

    async addDevice(device) {
        const id = device.deviceId || device.id;
        await this.saveDevice(device);
    }

    async updateDeviceInfo(device) {
        const id = device.deviceId || device.id;
        const updateData = {};
        if (device.connected !== undefined) updateData.connected = Boolean(device.connected);
        if (device.name !== undefined) updateData.name = device.name;
        updateData.updated_at = new Date();

        await this.devicesDb.update({ id }, updateData);
        this.devices[id] = { ...this.devices[id], ...updateData };
        logger.info(`[SMART HOME DB] Updated device info: ${id}`);
    }

    async updateDeviceState(deviceId, state) {
        if (!this.devices[deviceId]) {
            logger.error(`[SMART HOME DB] Device ${deviceId} doesn't exist`);
            throw new Error('Device does not exist');
        }
        const updateData = { state, updated_at: new Date() };
        await this.devicesDb.update({ id: deviceId }, updateData);
        this.devices[deviceId] = { ...this.devices[deviceId], ...updateData };
        logger.info(`[SMART HOME DB] Updated device state: ${deviceId}`);
    }

    async deleteDevice(deviceId) {
        await this.devicesDb.delete({ id: deviceId });
        delete this.devices[deviceId];
        logger.info(`[SMART HOME DB] Deleted device: ${deviceId}`);
    }

    async updateRoom(id, roomId) {
        return await this.devicesDb.update({ id }, { room: { id: roomId } })
    }
}

export const smartHomeDevicesDB = new SmartHomeDevicesDB();
export default SmartHomeDevicesDB;
