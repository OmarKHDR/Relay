import UltrasonicSensorHandler from '#lib/ros/topics/ultrasonic-topic.js';
import logger from '#utils/logger.js';
import timestamper from '#utils/timestamper.js';

function getDistance(req, res) {
    logger.info(`[ultrasonicController] Received request for ultrasonic sensor`);

    const distance = UltrasonicSensorHandler.getDistance();

    if (typeof distance !== 'number') {
        logger.warn('[ultrasonicController] Distance value undefined or unavailable');
        return res.status(503).json({
            status: 'fail',
            error: {
                code: 'NO_DATA',
                type: 'UnavailableError',
                message: 'Ultrasonic distance data not available at the moment.',
            },
            meta: { timestamp: timestamper() },
        });
    }

    logger.info(`[ultrasonicController] Returning distance value: ${distance}`);
    return res.status(200).json({
        status: 'success',
        data: [{ id: 1, distance }],
        meta: { timestamp: timestamper() },
    });
}

export default getDistance;
