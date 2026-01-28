import wheelChairHandler from '#src/api/v1/wheelchair/wheelchairTopic.js';
import logger from '#utils/logger.js';

class WsWheelchairController {
    constructor(wsServer) {
        this.wsServer = wsServer;
    }
    // injecting the events on every socket connection made
    onConnection(socket) {
        logger.info(`[wsWheelchairController] Socket connected: ${socket.id}`);

        // Handle velocity updates from client side
        socket.on('wheelchair:velocity', data => this.handleVelocity(data, socket));

        // Send initial connection acknowledgment with current velocity
        socket.emit('connected', {
            controller: 'wheelchair',
            currentVelocity: wheelChairHandler.getVelocity(),
        });
    }

    // Cleanup when socket disconnects {only some logs as no socket id was cached}
    onDisconnect(socket) {
        logger.info(`[wsWheelchairController] Socket disconnected: ${socket.id}`);
    }

    // helper method for setting velocity and validation
    handleVelocity(data, socket) {
        const { linear, angular } = data;

        logger.info(
            `[wsWheelchairController] Velocity update: linear=${linear}, angular=${angular}`
        );

        // Validation
        if (!this.validateVelocity(linear, angular)) {
            socket.emit('wheelchair:velocity:error', {
                type: 'VALIDATION_ERROR',
                message: 'Linear and angular must be numbers between -1 and 1',
            });
            return;
        }

        try {
            // Update the wheelchair velocity
            wheelChairHandler.setVelocity(linear, angular);

            // Broadcast to ALL connected clients
            this.broadcastVelocity({
                linear,
                angular,
                meta: {
                    timestamp: Date.now(),
                    source: socket.id,
                },
            });
        } catch (error) {
            logger.error(`[wsWheelchairController] Error setting velocity:`, error);
            socket.emit('wheelchair:velocity:error', {
                type: 'INTERNAL_ERROR',
                message: 'Failed to update velocity',
            });
        }
    }

    validateVelocity(linear, angular) {
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

    // Broadcast velocity to all connected clients
    broadcastVelocity(velocityData) {
        this.wsServer.broadcast('wheelchair:velocity', velocityData);
        logger.debug(`[wsWheelchairController] Broadcasted velocity to all clients`);
    }
}

export default WsWheelchairController;
