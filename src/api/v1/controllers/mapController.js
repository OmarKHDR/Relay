import MapHandler from "#lib/ros/topics/map-topic.js";
import logger from "#utils/logger.js";
import timestamper from "#utils/timestamp.js";

// Utility: convert quaternion to yaw (2D map)
function quaternionToYaw(quat) {
    const { x, y, z, w } = quat;
    return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
}

export async function getMap(req, res) {
    logger.info(`[MapController] Received request for Map info`);

    const { map, info } = await MapHandler.getMap();

    if (!Array.isArray(map) || !info) {
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

    // Convert origin quaternion to yaw
    const yaw = quaternionToYaw(info.origin.orientation);

    logger.info(`[MapController] Returning grid with resolution ${info.resolution}, size ${info.width}x${info.height}`);

    return res.status(200).json({
        status: 'success',
        data: {
            frame: "map",
            resolution: info.resolution,
            width: info.width,
            height: info.height,
            origin: {
                x: info.origin.position.x,
                y: info.origin.position.y,
                yaw: yaw
            },
            map: map
        },
        meta: { timestamp: timestamper() }
    });
}
