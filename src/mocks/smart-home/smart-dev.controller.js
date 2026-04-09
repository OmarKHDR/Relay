import fs from 'fs';
import process from 'process';

let specs;


function BootstrapController() {
    const specsString = fs.readFileSync('./src/mocks/smart-home/smart-dev.json');
    specs = JSON.parse(specsString);
    specs['serverPort'] = process.env.MOCK_SMART_DEVICE_SERVER_PORT || 5551;
}

BootstrapController();

export function getInfo(req, res) {
    return res.status(200).json(specs);
}

export function getStatus(req, res) {
    return res.status(200).json({
        deviceId: specs.deviceId,
        deviceName: specs.deviceName,
        devicePosition: specs.devicePosition,
        state: specs.state,
        controlType: specs.controlType,
    });
}

export function controlDev(req, res) {
    if (req.body && req.body.deviceId === specs.deviceId && req.body.state !== undefined) {
        specs.state = req.body.state;
        fs.writeFileSync('./src/mocks/smart-home/smart-dev.json', JSON.stringify(specs), {
            flag: 'w',
        });
        return res.status(201).send({ status: 'success' });
    }
    return res.status(401).send({ status: 'failed', reason: 'not matched device Id' });
}
