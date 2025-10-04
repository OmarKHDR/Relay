import wheelChairHandler from '#lib/ros/topics/wheelchair-topic.js';
import logger from '#utils/logger.js';
import timestamper from '#utils/timestamp.js';

function setWheelchairDirection(req, res) {
    const { direction } = req.body || {};
    logger.info(`[wheelchairController] Received direction: ${direction}`);

	const allowed = ['stop', 'forward', 'backward', 'left', 'right'];
    if (!allowed.includes(direction)) {
		logger.error(`[wheelchairController] direction not allowed: ${direction}`);
        return res.status(400).json({
            status: 'fail',
            error: {
                code: 'INVALID_DIRECTION',
				type: 'ValueError',
                message: `Invalid direction '${direction}', must be one of ${allowed.join(', ')}`,
            },
            meta: { timestamp: timestamper() },
        });
    }

    wheelChairHandler.move(direction);

    return res.status(200).json({
        status: 'success',
        data: [
			{ direction }
		],
        meta: { timestamp: timestamper() },
    });
}


export function getWheelchairDirection(req, res) {
    logger.info('[wheelchairController] Received request for wheelchair direction');

    const direction = wheelChairHandler.getDirection();

    if (typeof direction !== 'string') {
        logger.warn('[wheelchairController] Direction value undefined or unavailable');
        return res.status(503).json({
            status: 'fail',
            error: {
                code: 'NO_DATA',
                type: 'UnavailableError',
                message: 'Wheelchair direction not available at the moment.',
            },
            meta: { timestamp: timestamper() },
        });
    }

    logger.info(`[wheelchairController] Returning current direction: ${direction}`);
    return res.status(200).json({
        status: 'success',
        data: [{ id: 1, direction }],
        meta: { timestamp: timestamper() },
    });
}