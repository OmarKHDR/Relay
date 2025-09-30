import winston from 'winston';


const timezoned = () => {
  return new Date().toLocaleString( 'en-US', {
    	timeZone: process.env.TZ
	});
};


const logger = winston.createLogger({
	level: 'debug',
	transports: [
		new winston.transports.Console({
			level: 'debug',
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ level, message }) => `[${level}] ${message}`)
			)
		}),
		new winston.transports.File({
			level: 'error',
			filename: 'error.log',
			format: winston.format.combine(
				winston.format.timestamp({ format: timezoned }),
				winston.format.printf(({ timestamp, level, message }) => `${timestamp}: [${level}] ${message}`)
			)
		}),
		new winston.transports.File({
			filename: 'combined.log',
			format: winston.format.combine(
				winston.format.timestamp({ format: timezoned }),
				winston.format.printf(({ timestamp, level, message }) => `${timestamp}: [${level}] ${message}`)
			)
		})
	]
})

export default logger;