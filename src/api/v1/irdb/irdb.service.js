import fs from 'fs';
import path from 'path';

const IRDB_PATH = process.env.IRDB_PATH || './irdb';

function parseIrFile(fileContent) {
    const lines = fileContent.split(/\r?\n/);
    const results = [];
    let block = {};

    function flushBlock() {
        if (block.name) {
            if (block.type === 'parsed') {
                results.push({
                    name: block.name,
                    type: 'parsed',
                    protocol: block.protocol,
                    address: block.address,
                    command: block.command,
                });
            } else if (block.type === 'raw') {
                const dataStr = block.data || '';
                const data = dataStr.trim().split(/\s+/).map(s => parseInt(s, 10)).filter(n => !Number.isNaN(n));
                results.push({
                    name: block.name,
                    type: 'raw',
                    frequency: Number(block.frequency),
                    duty_cycle: Number(block.duty_cycle),
                    data,
                });
            }
        }
        block = {};
    }

    for (const line of lines) {
        if (line.startsWith('Filetype:') || line.startsWith('Version:')) continue;
        if (line.trim() === '#') {
            flushBlock();
            continue;
        }
        const colon = line.indexOf(':');
        if (colon === -1) continue;
        const key = line.slice(0, colon).trim();
        const value = line.slice(colon + 1).trim();
        block[key] = value;
    }
    flushBlock();
    return results;
}

export function getCategories() {
    const entries = fs.readdirSync(IRDB_PATH, { withFileTypes: true });
    return entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.'))
        .map(e => e.name)
        .sort();
}

export function getBrands(category) {
    const dir = path.join(IRDB_PATH, category);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        return null;
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.'))
        .map(e => e.name)
        .sort();
}

export function getModels(category, brand) {
    const dir = path.join(IRDB_PATH, category, brand);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        return null;
    }
    const entries = fs.readdirSync(dir, { withFileTypes: false });
    return entries
        .filter(name => name.endsWith('.ir'))
        .map(name => name.slice(0, -3))
        .sort();
}

export function getSignals(category, brand, model) {
    const filePath = path.join(IRDB_PATH, category, brand, `${model}.ir`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`IR file not found: ${category}/${brand}/${model}.ir`);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return parseIrFile(content);
}

const TRY_SIGNAL_NAMES = ['power', 'pwr', 'on_off', 'key_power'];

export function getTrySignal(signals) {
    if (!signals || signals.length === 0) return undefined;
    const found = signals.find(s => TRY_SIGNAL_NAMES.includes((s.name || '').toLowerCase().replace(/\s/g, '_')));
    return found ?? signals[0];
}
