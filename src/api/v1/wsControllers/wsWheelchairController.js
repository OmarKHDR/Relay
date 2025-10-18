// controllers/wsWheelchairController.js
import wheelChairHandler from '#lib/ros/topics/wheelchair-topic.js';
import logger from '#utils/logger.js';

class WsWheelchairController {
    constructor(wsServer) {
        this.wsServer = wsServer;
    }

    // Called for each new socket connection
    onConnection(socket) {
        logger.info(`[WheelchairController] Socket connected: ${socket.id}`);

        // Handle velocity updates from client
        socket.on('velocity', data => this.handleVelocity(data, socket));

        // Send initial connection acknowledgment with current velocity
        socket.emit('connected', {
            controller: 'wheelchair',
            currentVelocity: wheelChairHandler.getVelocity()
        });
    }

    // Cleanup when socket disconnects
    onDisconnect(socket) {
        logger.info(`[WheelchairController] Socket disconnected: ${socket.id}`);
    }

    handleVelocity(data, socket) {
        const { linear, angular } = data;
        
        logger.info(`[WheelchairController] Velocity update: linear=${linear}, angular=${angular}`);
        
        // Validation
        if (!this.validateVelocity(linear, angular)) {
            socket.emit('error', {
                type: 'VALIDATION_ERROR',
                message: 'Linear and angular must be numbers between -1 and 1',
                received: { linear, angular }
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
                timestamp: Date.now(),
                source: socket.id
            });

        } catch (error) {
            logger.error(`[WheelchairController] Error setting velocity:`, error);
            socket.emit('error', {
                type: 'INTERNAL_ERROR',
                message: 'Failed to update velocity'
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
        this.wsServer.broadcast('velocity', velocityData);
        logger.debug(`[WheelchairController] Broadcasted velocity to all clients`);
    }

    // Public method to broadcast velocity updates from external sources (e.g., ROS callbacks)
    publishVelocity(velocity) {
        if (!this.validateVelocity(velocity.linear, velocity.angular)) {
            logger.error(`[WheelchairController] Invalid velocity for publishing:`, velocity);
            return;
        }

        this.broadcastVelocity({
            ...velocity,
            timestamp: Date.now(),
            source: 'system'
        });
    }

    // Get controller statistics
    getStats() {
        return {
            controller: 'wheelchair',
            connectedClients: this.wsServer.getConnectionCount()
        };
    }
}

export default WsWheelchairController;