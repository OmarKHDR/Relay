import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as irdbService from '#modules/irdb/irdb.service.js';
import { handleFrame } from '#modules/ir/ir.controller.js';

const IR_EVENT = 'ir:frame';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_PATH = path.join(__dirname, '../../../src/api/v1/ir/ir.registry.json');

class FakeSocket extends EventEmitter {
    emit(eventName, payload) {
        super.emit(eventName, payload);
        return true;
    }
}

class FakeIO extends EventEmitter {
    emit(eventName, payload) {
        super.emit(eventName, payload);
        return true;
    }
}

function onceEvent(emitter, event) {
    return new Promise(resolve => {
        emitter.once(event, data => resolve(data));
    });
}

beforeEach(() => {
    // Reset registry before each test to a known state
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ devices: [] }, null, 2), 'utf8');
});

describe('IR Signal Translator flow over WebSocket frames', () => {
    test('try device, confirm registration, then translate command', async () => {
        // Pick a real device from the cloned IRDB
        const categories = irdbService.getCategories();
        expect(categories.length).toBeGreaterThan(0);

        const category = categories[0];
        const brands = irdbService.getBrands(category);
        expect(brands && brands.length).toBeGreaterThan(0);

        const brand = brands[0];
        const models = irdbService.getModels(category, brand);
        expect(models && models.length).toBeGreaterThan(0);

        const model = models[0];
        const signals = irdbService.getSignals(category, brand, model);
        expect(signals.length).toBeGreaterThan(0);

        const trySignalExpected = irdbService.getTrySignal(signals);
        expect(trySignalExpected).toBeDefined();

        const socket = new FakeSocket();
        const io = new FakeIO();

        // 1) IR_TRY: client asks for a test signal for this model
        const tryPromise = onceEvent(socket, IR_EVENT);

        handleFrame(
            socket,
            {
                type: 'IR_TRY',
                frame_id: 'frame-try',
                payload: { category, brand, model },
            },
            io
        );

        const tryResponse = await tryPromise;

        expect(tryResponse).toMatchObject({
            type: 'RESPONSE',
            frame_id: 'frame-try',
            payload: {
                status: 'ready',
                signal: expect.any(Object),
            },
        });

        const trySignal = tryResponse.payload.signal;
        // Should match either the preferred try signal or the first signal
        expect(trySignal.type).toBe(trySignalExpected.type);

        // 2) IR_TRY_CONFIRM: client confirms and registers the device
        const confirmPromise = onceEvent(socket, IR_EVENT);
        const registryUpdatePromise = onceEvent(io, IR_EVENT);

        handleFrame(
            socket,
            {
                type: 'IR_TRY_CONFIRM',
                frame_id: 'frame-confirm',
                payload: {
                    category,
                    brand,
                    model,
                    room: 'living_room',
                    device_name: 'Test Device',
                },
            },
            io
        );

        const confirmResponse = await confirmPromise;

        expect(confirmResponse).toMatchObject({
            type: 'RESPONSE',
            frame_id: 'frame-confirm',
            payload: {
                status: 'registered',
                device_id: expect.any(String),
            },
        });

        const deviceId = confirmResponse.payload.device_id;

        const registryEvent = await registryUpdatePromise;

        expect(registryEvent).toMatchObject({
            type: 'EVENT',
            payload: {
                event: 'ir_registry_update',
                registry: {
                    devices: expect.arrayContaining([
                        expect.objectContaining({
                            id: deviceId,
                            room: 'living_room',
                        }),
                    ]),
                },
            },
        });

        // 3) IR_TRANSLATE: client sends a command and expects the signal back
        const translatePromise = onceEvent(socket, IR_EVENT);
        const commandName = trySignalExpected.name;

        handleFrame(
            socket,
            {
                type: 'IR_TRANSLATE',
                frame_id: 'frame-translate',
                payload: {
                    device_id: deviceId,
                    command: commandName,
                },
            },
            io
        );

        const translateResponse = await translatePromise;

        expect(translateResponse).toMatchObject({
            type: 'RESPONSE',
            frame_id: 'frame-translate',
            payload: {
                status: 'ok',
                signal: expect.any(Object),
            },
        });

        const translatedSignal = translateResponse.payload.signal;

        // Translated signal should match the underlying IRDB signal data
        if (trySignalExpected.type === 'parsed') {
            expect(translatedSignal).toMatchObject({
                type: 'parsed',
                protocol: trySignalExpected.protocol,
                address: trySignalExpected.address,
                command: trySignalExpected.command,
            });
        } else if (trySignalExpected.type === 'raw') {
            expect(translatedSignal.type).toBe('raw');
            expect(translatedSignal.frequency).toBeCloseTo(Number(trySignalExpected.frequency));
            expect(translatedSignal.data).toEqual(trySignalExpected.data);
        }
    });
});

