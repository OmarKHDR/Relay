import * as irService from './ir.service.js';
import * as irdbService from '#modules/irdb/irdb.service.js';

const IR_FRAME_EVENT = 'ir:frame';

export function getDevices(req, res) {
    try {
        const registry = irService.getRegistry();
        return res.status(200).json(registry);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export function getDeviceById(req, res) {
    const { id } = req.params;
    try {
        const device = irService.getDeviceById(id);
        return res.status(200).json(device);
    } catch (err) {
        if (err.message === 'Device not found') {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

export function deleteDevice(req, res) {
    const { id } = req.params;
    try {
        irService.deleteDevice(id);
        return res.status(200).json({ status: 'deleted' });
    } catch (err) {
        if (err.message === 'Device not found') {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

export function handleFrame(socket, frame, io) {
    const frameId = frame.frame_id;
    const payload = frame.payload || {};
    const type = frame.type;

    const reply = (obj) => {
        socket.emit(IR_FRAME_EVENT, obj);
    };

    const replyError = (message) => {
        socket.emit(IR_FRAME_EVENT, { type: 'ERROR', frame_id: frameId, payload: { message } });
    };

    if (type === 'IR_TRY') {
        try {
            const { category, brand, model } = payload;
            const signals = irdbService.getSignals(category, brand, model);
            const trySignal = irdbService.getTrySignal(signals);
            reply({ type: 'RESPONSE', frame_id: frameId, payload: { status: 'ready', signal: trySignal } });
        } catch (err) {
            replyError(err.message);
        }
        return;
    }

    if (type === 'IR_TRY_CONFIRM') {
        try {
            const device = irService.confirmDevice({
                category: payload.category,
                brand: payload.brand,
                model: payload.model,
                room: payload.room,
                deviceName: payload.device_name,
            });
            reply({ type: 'RESPONSE', frame_id: frameId, payload: { status: 'registered', device_id: device.id } });
            const registry = irService.getRegistry();
            io.emit(IR_FRAME_EVENT, {
                type: 'EVENT',
                payload: { event: 'ir_registry_update', registry },
            });
        } catch (err) {
            replyError(err.message);
        }
        return;
    }

    if (type === 'IR_TRANSLATE') {
        try {
            const signal = irService.translate(payload.device_id, payload.command);
            reply({ type: 'RESPONSE', frame_id: frameId, payload: { status: 'ok', signal } });
        } catch (err) {
            replyError(err.message);
        }
        return;
    }

    replyError(`Unknown frame type: ${type}`);
}
