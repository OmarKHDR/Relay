import logger from '#utils/logger.js';
import { dbRepositories } from '#src/db/db.repositories.js';
import { AppDataSource } from '#src/db/datasources.js';

class SmartHomeDevicesDB {
    constructor() {
        this.devices;
    }

    get devicesDb() {
        return dbRepositories.device;
    }

    async readDbContent() {
        try {
            const devicesArr = await this.devicesDb.find({ relations: { room: true } });
            this.devices = {};
            for (const dev of devicesArr) {
                this.devices[dev.id] = dev;
            }
            return this.devices;
        } catch (err) {
            if (!AppDataSource.isInitialized) {
                throw err;
            }
            logger.warn(`[SMART HOME DB] Failed to read DB, initializing empty: ${err.message}`);
            this.devices = {};
            return this.devices;
        }
    }

    async getAllDevices() {
        if (this.devices) {
            return this.devices;
        } else {
            return await this.readDbContent();
        }
    }

    async getDevice(id) {
        const devices = await this.getAllDevices();
        return devices[id];
    }

    async saveDevice(device, room) {
        const devices = await this.getAllDevices();
        const id = device.deviceId ?? device.id;
        if (room.name || room.id) {
            const dbroom = await dbRepositories.room.findOne({
                where: { name: room.name, id: room.id },
            });
            if (!dbroom) {
                throw new Error(`room ${device.roomName} doesn't exist`);
            }
            device.roomId = room.id;
        }
        const fullDevice = {
            ...device,
            id,
            control_type: device.control_type,
            connected: device.connected ?? false,
            created_at: device.created_at ?? new Date(),
            updated_at: new Date(),
            room: device.roomId ? { id: device.roomId } : undefined,
        };
        const savedDevice = await this.devicesDb.save(fullDevice);
        devices[id] = savedDevice;
        logger.info(`[SMART HOME DB] Saved device: ${id}`);
        return savedDevice;
    }

    async updateDeviceInfo(device) {
        const devices = await this.getAllDevices();
        const id = device.deviceId || device.id;
        const updateData = {};
        if (device.connected !== undefined) updateData.connected = Boolean(device.connected);
        if (device.name !== undefined) updateData.name = device.name;
        if (device.control_type !== undefined) {
            updateData.control_type = device.control_type;
        }
        updateData.updated_at = new Date();

        await this.devicesDb.update({ id }, updateData);
        devices[id] = { ...devices[id], ...updateData };
        logger.info(`[SMART HOME DB] Updated device info: ${id}`);
        return devices[id];
    }

    async updateDeviceState(deviceId, state) {
        const devices = await this.getAllDevices();
        if (!devices[deviceId]) {
            logger.error(`[SMART HOME DB] Device ${deviceId} doesn't exist`);
            throw new Error('Device does not exist');
        }
        const updateData = { state, updated_at: new Date() };
        await this.devicesDb.update({ id: deviceId }, updateData);
        devices[deviceId] = { ...devices[deviceId], ...updateData };
        logger.info(`[SMART HOME DB] Updated device state: ${deviceId}`);
        return devices[deviceId];
    }

    async deleteDevice(deviceId) {
        const devices = await this.getAllDevices();
        await this.devicesDb.delete({ id: deviceId });
        delete devices[deviceId];
        logger.info(`[SMART HOME DB] Deleted device: ${deviceId}`);
    }

    async updateRoom(id, roomId) {
        const devices = await this.getAllDevices();
        const result = await this.devicesDb.update({ id }, { room: { id: roomId } });
        devices[id] = { ...devices[id], room: { id: roomId } };
        return result;
    }
}

export const smartHomeDevicesDB = new SmartHomeDevicesDB();
export default SmartHomeDevicesDB;
