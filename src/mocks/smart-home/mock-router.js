import { Router } from 'express';
import fs from 'fs';
const router = Router();


const specsString = fs.readFileSync("./src/mocks/smart-home/smart-dev.json");
const specs = JSON.parse(specsString);


router.get('/info', (req, res) => {
    res.status(200).send(specs);
    return;
});

router.get('/status', (req, res) => {
    res.status(200).send({
        deviceId: specs.deviceId,
        deviceName: specs.deviceName,
        devicePosition: specs.devicePosition,
        state: specs.state,
        controlType: specs.controlType,
    });
    return;
});

router.post('/control', (req, res) => {
	console.log(req.body);
    if (req.body && req.body.deviceId === specs.deviceId) {
        fs.writeFileSync("./src/mocks/smart-home/smart-dev.json", JSON.stringify(specs), { flag: 'w' });
				return res.status(201).send({"status": "success"});
    }
		return res.status(401).send({"status": "failed", "reason": "not matched device Id"});
});

export const mockSmartHomeRouter = router;
// {
// 		"deviceId": "relay-a3f9c1",
// 		"deviceName": "Kitchen-lights",
// 		"position": "Kitchen",
// 		"version": "1.0.0",
// 		"ip": "192.168.1.42",
// 		"controlType": "binary",
// 		"state": 1
// }
