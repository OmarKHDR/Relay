import { smartHomeService } from './smart-home.service.js';

class SmartHomeController {
    async discover(req, res, next) {
        try {
            const timeoutMs = Number(req.query?.timeoutMs ?? 4000);
            const devices = await smartHomeService.discoverDevices(
                timeoutMs < 10_000 && timeoutMs > 0 ? timeoutMs : 400
            );

            res.status(200).json({
                success: true,
                data: devices,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                reason: 'bad request',
            });
        }
    }

    async getAllDevices(req, res, next) {
        try {
            const devices = smartHomeService.getAllDevices();
            res.status(200).json({
                success: true,
                data: devices,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                reason: 'failed to retrieve devices',
            });
        }
    }

    async getStatus(req, res, next) {
        try {
            const { deviceId } = req.query;
            if (!deviceId)
                return res.status(400).json({ success: false, reason: 'deviceId is required' });
            const response = await smartHomeService.getDevInfo(deviceId);
            return res.status(200).json({
                success: true,
                data: response,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                reason: 'bad request',
            });
        }
    }

    async getInfo(req, res, next) {
        try {
            const { deviceId } = req.query;
            if (!deviceId)
                return res.status(400).json({ success: false, reason: 'deviceId is required' });

            const device = smartHomeService.getDevice(deviceId);
            if (!device)
                return res.status(404).json({ success: false, reason: 'device not found' });

            res.status(200).json({
                success: true,
                data: device,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                reason: 'bad request',
            });
        }
    }

    async control(req, res, next) {
        try {
            const { deviceId, state } = req.body;
            if (!deviceId || state === undefined)
                return res
                    .status(400)
                    .json({ success: false, reason: 'deviceId and state are required' });

            const success = await smartHomeService.controlDev(deviceId, state);
            if (!success)
                return res
                    .status(500)
                    .json({ success: false, reason: 'failed to change device state' });

            res.status(200).json({
                success: true,
                data: null,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                reason: error.message || 'bad request',
            });
        }
    }

    async registerDevice(req, res, next) {
        try {
            const device = req.body;
            if (!device || !device.deviceId)
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
        } catch (error) {
            res.status(400).json({
                success: false,
                reason: error.message || 'failed to register device',
            });
        }
    }

    async updateDeviceLocation(req, res, next) {
        try {
            const { deviceId, location } = req.body;
            if (!deviceId || !location)
                return res
                    .status(400)
                    .json({ success: false, reason: 'deviceId and location are required' });

            const success = await smartHomeService.updateDevice({
                deviceId,
                position: location,
                lastUpdated: new Date().toISOString(),
            });

            if (!success) throw new Error('Failed to update device');

            res.status(200).json({
                success: true,
                reason: 'device location updated successfully',
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
