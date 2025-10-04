import servoMotorHandler from '#lib/ros/topics/servo-motor-topic.js';
import logger from '#utils/logger.js';
import timestamper from '#utils/timestamper.js';

export function setServoAngle(req, res) {
	const { angle } = req.body || {};
	logger.info(`[servoController] Received request to set servo angle: ${angle}`);

	// Validate type
	if (typeof angle !== 'number') {
		logger.warn(`[servoController] Invalid angle type: ${typeof angle}`);
		return res.status(400).json({
			status: 'fail',
			error: {
				code: 'INVALID_TYPE',
				type: 'TypeError',
				message: `Expected numeric angle, got ${typeof angle}`,
			},
			meta: { timestamp: timestamper() },
		});
	}

	// Validate range
	if (angle < 0 || angle > 180) {
		logger.warn(`[servoController] Angle out of range: ${angle}`);
		return res.status(400).json({
			status: 'fail',
			error: {
				code: 'INVALID_VALUE',
				type: 'ValueError',
				message: `Angle must be between 0 and 180 (received ${angle})`,
			},
			meta: { timestamp: timestamper() },
		});
	}

	// Valid input → publish
	logger.info(`[servoController] Publishing servo angle: ${angle}`);
	servoMotorHandler.publishAngle(angle);

	return res.status(200).json({
		status: 'success',
		data: [{ angle }],
		meta: { timestamp: timestamper() },
	});
}


export function getServoAngle(req, res) {
	logger.info('[servoController] Received request for current servo angle');

	const angle = servoMotorHandler.getAngle();

	if (typeof angle !== 'number') {
		logger.warn('[servoController] Servo angle unavailable');
		return res.status(503).json({
			status: 'fail',
			error: {
				code: 'NO_DATA',
				type: 'UnavailableError',
				message: 'Servo angle not available at the moment.',
			},
			meta: { timestamp: timestamper() },
		});
	}

	logger.info(`[servoController] Returning current servo angle: ${angle}`);
	return res.status(200).json({
		status: 'success',
		data: [
			{
				id: 1,
				name: "primary servomotor",
				angle,
			}
		],
		meta: { timestamp: timestamper() },
	});
}