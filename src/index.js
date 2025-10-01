import dotenv from 'dotenv';
dotenv.config();
import logger from './utils/logger.js';
import timestamper from './utils/timestamp.js';
import express from 'express';
import apiRouter from './api/v1/routes.js';
import morgan from 'morgan';

// connections info
const serverHostname= process.env.SERVER_HOSTNAME;
const serverPort= process.env.SERVER_PORT;


const app = express();

//create a logger for logging the requests
app.use(morgan(":method :url :status :response-time ms",{
	stream: {
		write: (message) => logger.info(message.trim()),
		},
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', apiRouter);

app.listen(serverPort, serverHostname, () => {
	logger.info(`server is running on ${serverHostname}:${serverPort}`);
});