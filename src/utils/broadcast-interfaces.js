import os from 'os';
import logger from './logger.js';

function getBestInterface() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
        for (const iface of addrs) {
            if (iface.family !== 'IPv4' || iface.internal) continue;

            const ip = iface.address;
            const parts = ip.split('.').map(Number);

            // Is it a private/local IP?
            const isPrivate =
                parts[0] === 10 ||
                (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
                (parts[0] === 192 && parts[1] === 168);

            if (!isPrivate) continue; // public IPs are never your LAN

            let score = 0;

            // 192.168.x.x is the most common home router range
            if (parts[0] === 192 && parts[1] === 168) score += 3;

            // Common WiFi interface name patterns
            const n = name.toLowerCase();
            if (/wi.?fi|wlan|wireless|wifi/.test(n)) score += 3;
            if (/en\d|eth\d|local/.test(n)) score += 1; // ethernet, still valid

            // Avoid virtual/container interfaces
            if (/vmnet|vbox|docker|virbr|loopback|virtual|hamachi|tun|tap/.test(n)) score -= 5;

            // Prefer /24 subnets (typical home network)
            if (iface.netmask === '255.255.255.0') score += 1;

            // Compute broadcast
            const maskParts = iface.netmask.split('.').map(Number);
            const broadcast = parts.map((p, i) => p | (~maskParts[i] & 0xff)).join('.');

            candidates.push({ name, ip, broadcast, score });
        }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    console.log('[Broadcast Interface] Ranked interfaces:', candidates); // helpful for debugging
    return candidates[0] ?? null; // best match
}

const best = getBestInterface();
logger.info(`[Broadcast Interface] interface chosen: ${best.broadcast}`);
export default best;
