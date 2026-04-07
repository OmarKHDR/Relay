import { smartHomeService } from './smart-home.service.js';

class SmartHomeController {
    discover = async (req, res, next) => {
        try {
            const timeoutMs = Number(req.query?.timeoutMs ?? 400);
            const devices = await smartHomeService.discoverDevices(
                Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 400
            );

            res.status(200).json({
                success: true,
                data: devices,
            });
        } catch (error) {
            next(error);
        }
    };
}

export const smartHomeController = new SmartHomeController();
export default SmartHomeController;