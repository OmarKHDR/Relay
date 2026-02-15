import wheelChairHandler from '#modules/wheelchair/ros/wheelchairTopic.js';
import logger from '#utils/logger.js';
import timestamper from '#utils/timestamp.js';

export const wheelchairCallback = {
    publish: [
        {
            eventName: 'wheelchair:velocity',
            callback: updateVelocity,
        },
    ],
    subscribe: [],
    broadcast: [
        {
            eventName: 'wheelchair:velocity',
            callback: broadcastingVelocity,
        },
    ],
    cleanup: () => {},
};

function updateVelocity(data) {
    const { linear, angular } = data;

    logger.info(`[wsWheelchairCallback] Velocity update: linear=${linear}, angular=${angular}`);

    // Validation
    if (!validateVelocity(linear, angular)) {
        logger.warn(
            `[wsWheelchairCallback] failed to update Velocity: non-valid speed linear=${linear}, angular=${angular}`
        );
        return;
    }

    try {
        // Update the wheelchair velocity
        wheelChairHandler.setVelocity(linear, angular);
    } catch (error) {
        logger.error(`[wsWheelchairCallback] Error setting velocity:`, error);
    }
}

function validateVelocity(linear, angular) {
    return (
        typeof linear === 'number' &&
        typeof angular === 'number' &&
        !isNaN(linear) &&
        !isNaN(angular) &&
        linear >= -1 &&
        linear <= 1 &&
        angular >= -1 &&
        angular <= 1
    );
}

function broadcastingVelocity(io, eventName) {
    const handler = data => {
        io.emit(eventName, {
            linear: data.linear,
            angular: data.angular,
            meta: {
                timestamp: timestamper(),
                source: 'helloworld',
            },
        }); // use emit, not broadcast
    };

    wheelChairHandler.on('velocity:change', handler);
}
