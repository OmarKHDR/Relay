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
                reason: 'bad request'
            })
        }
    };

    async getStatus(req, res, next) {
        try {
            const { deviceId } = req.query;
            if (!deviceId) return res.status(400).json({ success: false, reason: 'deviceId is required' });
            const response = await smartHomeService.getDevStatus(deviceId);
            let data = null;
            if (response && response.ok) {
                data = await response.json().catch(() => null);
            }
            res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                reason: 'bad request'
            })
        }
    }

    async getInfo(req, res, next) {
        try {
            const { deviceId } = req.query;
            if (!deviceId) return res.status(400).json({ success: false, reason: 'deviceId is required' });
            const device = smartHomeService.devices[deviceId];
            res.status(200).json({
                success: true,
                data: device,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                reason: 'bad request'
            })
        }
    }

    async control(req, res, next) {
        try {
            const { deviceId, state } = req.body;
            if (!deviceId || state === undefined) return res.status(400).json({ success: false, reason: 'deviceId and state are required' });
            const response = await smartHomeService.controlDev(deviceId, state);
            let data = null;
            if (response && response.ok) {
                data = await response.json().catch(() => null);
            }
            res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                reason: 'bad request'
            })
        }
    }
}

export const smartHomeController = new SmartHomeController();
export default SmartHomeController;