import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as irdbService from '#modules/irdb/irdb.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, 'ir.registry.json');
const REGISTRY_TMP_PATH = path.join(__dirname, 'ir.registry.tmp.json');

const CATEGORY_ICON = {
    TVs: 'tv',
    Air_Conditioners: 'ac',
    Fans: 'fan',
    Audio: 'speaker',
};

function readRegistry() {
    const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return JSON.parse(raw);
}

function writeRegistry(registry) {
    fs.writeFileSync(REGISTRY_TMP_PATH, JSON.stringify(registry, null, 2), 'utf8');
    fs.renameSync(REGISTRY_TMP_PATH, REGISTRY_PATH);
}

function signalWithoutName(signal) {
    if (signal.type === 'parsed') {
        const { name, ...rest } = signal;
        return rest;
    }
    const { name, ...rest } = signal;
    return rest;
}

export function getRegistry() {
    return readRegistry();
}

export function getDeviceById(id) {
    const registry = readRegistry();
    const device = registry.devices.find(d => d.id === id);
    if (!device) throw new Error('Device not found');
    return device;
}

export function confirmDevice({ category, brand, model, room, deviceName }) {
    const signals = irdbService.getSignals(category, brand, model);
    const icon = CATEGORY_ICON[category] ?? 'device';
    const device = {
        id: crypto.randomUUID(),
        name: deviceName ?? `${brand} ${model}`,
        room,
        icon,
        capabilities: signals.map(s => s.name),
        source: { category, brand, model },
        commands: Object.fromEntries(signals.map(s => [s.name, signalWithoutName(s)])),
        registered_at: new Date().toISOString(),
    };
    const registry = readRegistry();
    registry.devices.push(device);
    writeRegistry(registry);
    return device;
}

export function deleteDevice(id) {
    const registry = readRegistry();
    const index = registry.devices.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Device not found');
    registry.devices.splice(index, 1);
    writeRegistry(registry);
}

export function translate(deviceId, commandName) {
    const device = getDeviceById(deviceId);
    const signal = device.commands[commandName];
    if (signal === undefined) throw new Error(`Command not found: ${commandName}`);
    return signal;
}
