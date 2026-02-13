import logger from "#utils/logger.js";
import mapService from "./map.service.js";
import timestamper from "#utils/timestamp.js";



export async function getMap(req, res) {
    logger.info(`[MAP CONTROLLER] Received request for Map info`);
    try {
        const data = mapService.getMap();
        logger.info(`[MapController] Returning grid with resolution ${data.resolution}, size ${data.width}x${data.height}`);
        return res.status(200).json({
            status: 'success',
            data,
            meta: { timestamp: timestamper() }
        });
    } catch (err) {
        logger.error('[MapController] map data undefined or unavailable ', err);
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
}
