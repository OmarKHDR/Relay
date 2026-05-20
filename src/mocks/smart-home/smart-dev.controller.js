import fs from 'fs';
import process from 'process';

let specs;

function BootstrapController() {
    const specsString = fs.readFileSync('./src/mocks/smart-home/smart-dev.json');
    specs = JSON.parse(specsString);
    specs['port'] = process.env.SMART_DEV_PORT || 19803;
}

BootstrapController();

export function getInfo(req, res) {
    return res.status(200).json(specs);
}

export function getStatus(req, res) {
    return res.status(200).json({
        deviceId: specs.deviceId,
        state: specs.state,
        control_type: specs.control_type,
    });
}

export function controlDev(req, res) {
    if (req.body && req.body.deviceId === specs.deviceId && req.body.state !== undefined) {
        specs.state = req.body.state;
        fs.writeFileSync(
            './src/mocks/smart-home/smart-dev.json',
            JSON.stringify(specs, undefined, 2),
            {
                flag: 'w',
            }
        );
        return res.status(201).send({ status: 'success' });
    }
    return res.status(401).send({ status: 'failed', reason: 'not matched device Id' });
}
