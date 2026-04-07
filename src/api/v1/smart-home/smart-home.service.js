import { localDiscovery } from './discovery.udp.js';

class SmartHomeService {
    async discoverDevices(timeoutMs = 400) {
        return localDiscovery.discoverDevices(timeoutMs);
    }
}

export const smartHomeService = new SmartHomeService();
export default SmartHomeService;