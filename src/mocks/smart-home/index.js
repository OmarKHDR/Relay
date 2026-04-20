import express from 'express';
import 'dotenv/config';
import process from 'process';
import bodyParser from 'body-parser';
import logger from '../../utils/logger.js';
import { mockDeviceDiscovery } from './discovery.js';
import mockSmartHomeRouter from './routes.js';

const PORT = process.env.SMART_DEV_PORT || 19803 ;
const app = express();

logger.info(`loaded device data: ${JSON.stringify(mockDeviceDiscovery.specs)}`);
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(mockSmartHomeRouter);

app.listen(PORT, () => {
    logger.info(`[MOCK SMARTHOME SERVER]: server starting at port ${PORT}`);
});
