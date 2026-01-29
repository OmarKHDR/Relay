import wheelChairHandler from '#modules/wheelchair/wheelchairTopic.js';
import logger from '#utils/logger.js';
import timestamper from '#utils/timestamp.js';

export function updateVelocity(req, res) {
    const { linear, angular } = req.body || {};
    logger.info(`[wheelchairController] Received inputs: linear=${linear}, angular=${angular}`);
    if (
        typeof linear !== 'number' ||
        typeof angular !== 'number' ||
        linear < -1 ||
        linear > 1 ||
        angular < -1 ||
        angular > 1
    ) {
        return res.status(400).json({
            status: 'fail',
            error: {
                code: 'INVALID_INPUT',
                type: 'ValueError',
                message: 'Linear and angular values must be numbers between -1 and 1.',
            },
            meta: { timestamp: timestamper() },
        });
    }

    wheelChairHandler.setVelocity(linear, angular);
    return res.status(200).json({
        status: 'success',
        data: [{ id: 1, name: 'wheelchair', linear, angular }],
        meta: { timestamp: timestamper() },
    });
}

export function getVelocity(req, res) {
    logger.info('[wheelchairController] Received request for wheelchair velocity');
    const velocity = {
        linear: wheelChairHandler.linearInput,
        angular: wheelChairHandler.angularInput,
    };

    return res.status(200).json({
        status: 'success',
        data: [{ id: 1, name: 'wheelchair', velocity }],
        meta: { timestamp: timestamper() },
    });
}
