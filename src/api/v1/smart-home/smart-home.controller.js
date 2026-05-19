import { smartHomeService } from './smart-home.service.js';

class SmartHomeController {
    async discover(req, res, next) {
        const timeoutMs = Number(req.query?.timeoutMs ?? 4000);
        const devices = await smartHomeService.discoverDevices(
            timeoutMs < 10_000 && timeoutMs > 0 ? timeoutMs : 400
        );
        return devices;
    }

    async getAllDevices(req, res, next) {
        const devices = smartHomeService.getAllDevices();
        return devices;
    }

    async getInfo(req, res, next) {
        const { id } = req.query;
        const response = await smartHomeService.getDevInfo(id);
        return response;
    }

    async getDevice(req, res, next) {
        const { id } = req.query;
        const device = smartHomeService.getDevice(id);
        return device;
    }

    async control(req, res, next) {
        const { id, state } = req.body;
        const device = await smartHomeService.controlDev(id, state);
        return device;
    }

    async registerDevice(req, res, next) {
        const device = req.body;
        if (!device || !device.id)
            return res
                .status(400)
                .json({ success: false, reason: 'device object with id is required' });

        const success = await smartHomeService.addDevice(device);
        if (!success) throw new Error('Device already exists or failed to register');

        res.status(201).json({
            success: true,
            reason: 'device registered successfully',
            data: device,
        });
    }

    async updateDeviceInfo(req, res, next) {
        try {
            const { deviceId, location, name } = req.body;
            if (!deviceId || !(location || name))
                return res.status(400).json({
                    success: false,
                    reason: 'deviceId and at least one of location/name are required',
                });

            const success = await smartHomeService.updateDevice({
                deviceId,
                position: location,
                name,
                lastUpdated: new Date().toISOString(),
            });

            if (!success) throw new Error('Failed to update device');

            res.status(200).json({
                success: true,
                reason: 'device info updated successfully',
                data: smartHomeService.getDevice(deviceId),
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                reason: error.message || 'failed to update device location',
            });
        }
    }

    async deleteDevice(req, res, next) {
        try {
            const { deviceId } = req.params;
            if (!deviceId)
                return res.status(400).json({ success: false, reason: 'deviceId is required' });

            const success = await smartHomeService.deleteDevice(deviceId);
            if (!success) throw new Error('Failed to delete device');

            res.status(200).json({
                success: true,
                reason: 'device deleted successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                reason: error.message || 'failed to delete device',
            });
        }
    }
}

export const smartHomeController = new SmartHomeController();
export default SmartHomeController;
