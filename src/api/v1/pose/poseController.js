import PoseHandler from '#src/api/v1/pose/poseTopic.js';
import logger from '#utils/logger.js';
import timestamper from '#utils/timestamp.js';

export async function getPose(req, res) {
    logger.info('[PoseController] Received request for robot pose');

    const pose = PoseHandler.getPose();

    if (!pose) {
        logger.warn('[PoseController] pose data unavailable');
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

    return res.status(200).json({
        status: 'success',
        data: {
            frame: pose.frame, // expected: "map"
            x: pose.x,
            y: pose.y,
            yaw: pose.yaw,
        },
        meta: { timestamp: timestamper(), stamp: pose.stamp },
    });
}
