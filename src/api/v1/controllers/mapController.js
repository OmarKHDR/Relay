import MapHandler from "#lib/ros/topics/map-topic.js";
import logger from "#utils/logger.js";
import timestamper from "#utils/timestamp.js";



export async function getMap(req, res) {
    logger.info(`[MapController] Received request for Map info`);
    const {map, info} = await MapHandler.getMap();
     if (typeof map !== 'Array') {
        logger.warn('[MapController] map data undefined or unavailable');
        return res.status(503).json({
            status: 'fail',
            error: {
                code: 'NO_DATA',
                type: 'UnavailableError',
                message: 'map occupancy grid data not available at the moment.',
            },
            meta: { timestamp: timestamper() },
        });
    }

    logger.info(`[MapController] Returning grid`);
    return res.status(200).json({
        status: 'success',
        data: [{ id: 1, map, info}],
        meta: { timestamp: timestamper() },
    });
}