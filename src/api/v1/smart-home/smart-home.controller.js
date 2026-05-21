import { smartHomeService } from './smart-home.service.js';

export async function discover(req, res, next) {
    const timeoutMs = Number(req.query?.timeoutMs ?? 4000);
    const devices = await smartHomeService.discoverDevices(
        timeoutMs < 10_000 && timeoutMs > 0 ? timeoutMs : 400
    );
    return devices;
}

export async function getAllDevices(req, res, next) {
    const devices = smartHomeService.getAllDevices();
    return devices;
}

export async function getInfo(req, res, next) {
    const { id } = req.params;
    const response = await smartHomeService.getDevInfo(id);
    return response;
}

export async function getDevice(req, res, next) {
    const { id } = req.params;
    const device = smartHomeService.getDevice(id);
    return device;
}

export async function control(req, res, next) {
    const { id, state } = req.body;
    const device = await smartHomeService.controlDev(id, state);
    return device;
}

export async function registerDevice(req, res, next) {
    const device = req.body;
    const savedDevice = await smartHomeService.addDevice(device.device, device.room);
    return savedDevice;
}

export async function updateDeviceInfo(req, res, next) {
    const { id, room, name } = req.body;
    const device = await smartHomeService.updateDevice({
        id,
        room,
        name,
    });
    return device;
}

export async function deleteDevice(req, res, next) {
    const { id } = req.params;
    await smartHomeService.deleteDevice(id);
    return {
        id,
        deleted: true,
    };
}

export async function changeDeviceRoom(req, res, next) {
    const { id } = req.params;
    const { roomId } = req.body;
    const device = await smartHomeService.changeDeviceRoom({ id, roomId });
    return device;
}
