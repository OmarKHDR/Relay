import winston from 'winston';
import timestamper from './timestamp.js';



const logger = winston.createLogger({
	level: 'debug',
	transports: [
		new winston.transports.Console({
			level: 'debug',
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp({format: timestamper}),
				winston.format.printf(({ timestamp, level, message }) => `${timestamp} - [${level}] ${message}`)
			)
		}),
		new winston.transports.File({
			level: 'error',
			filename: 'error.log',
			format: winston.format.combine(
				winston.format.timestamp({ format: timestamper }),
				winston.format.printf(({ timestamp, level, message }) => `${timestamp} - [${level}] ${message}`)
			)
		}),
		new winston.transports.File({
			filename: 'combined.log',
			format: winston.format.combine(
				winston.format.timestamp({ format: timestamper }),
				winston.format.printf(({ timestamp, level, message }) => `${timestamp} - [${level}] ${message}`)
			)
		})
	]
})

export default logger;