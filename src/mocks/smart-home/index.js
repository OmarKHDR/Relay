import express from 'express';
import 'dotenv/config';
import process from 'process';
import bodyParser from 'body-parser';
import logger from '../../utils/logger.js';
import { mockDeviceDiscovery } from './discovery.js';
import { mockSmartHomeRouter } from './mock-router.js';

const PORT = process.env.MOCK_SMART_HOME_SERVER_PORT || 5555;
const app = express();

logger.info(`loaded device data: ${JSON.stringify(mockDeviceDiscovery.specs)}`);
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(mockSmartHomeRouter);

app.listen(PORT, () => {
    logger.info(`[MOCK SMARTHOME SERVER]: server starting at port ${PORT}`);
});
