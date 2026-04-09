import { localDiscovery } from './discovery.udp.js';
import { smartHomeRosService } from './ros/smart-home.ros.service.js';

class SmartHomeService {
    constructor() {
        this.devices = {};
    }
    async discoverDevices(timeoutMs = 400) {
        this.devices = await localDiscovery.discoverDevices(timeoutMs);
        
        // Register newly discovered devices with ROS
        for (const [deviceId, device] of Object.entries(this.devices)) {
            try {
                // Determine room from location or name
                const roomName = device.position || device.room || "";
                await smartHomeRosService.registerDevice(device, roomName);
            } catch (err) {
                console.error(`[SMART HOME] Failed to register device ${deviceId} with ROS:`, err);
            }
        }
        
        return this.devices;
    }

    async getDevStatus(deviceId) {
        let deviceStatus;
        if (this.devices[deviceId]) {
            const device = this.devices[deviceId];
            return await fetch(`http://${device.ip}:${device}/status`)
        }
        return;
    }

    async controlDev(deviceId, state) {
        if (this.devices[deviceId]) {
            const device = this.devices[deviceId];
            return await fetch(`http://${device.ip}:${device}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state, deviceId }),
            })
        }
        return;
    }
}
export const smartHomeService = new SmartHomeService();
export default SmartHomeService;