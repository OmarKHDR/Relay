import logger from '#utils/logger.js';
import timestamper from '#utils/timestamp.js';
import poseService from './pose.service.js';

export async function getPose(req, res) {
    try {
        logger.info('[POSE CONTROLLER] Received request for robot pose');
        const poseData = poseService.getPose();
        return res.status(200).json({
        status: 'success',
        data: poseData,
        meta: { timestamp: timestamper() },
    });
    } catch (err) {
        logger.error('[POSE CONTROLLER] Error processing the pose', err);
        return res.status(503).json({
            status: 'fail',
            error: {
                code: 'NO_DATA',
                type: 'UnavailableError',
                message: 'robot pose not available yet',
            },
            meta: { timestamp: timestamper() },
        });
    }
}
