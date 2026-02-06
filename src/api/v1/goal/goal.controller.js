import GoalService from './goal.service.js';
import logger from '#utils/logger.js';
import timestamper from '#utils/timestamp.js';

export async function setGoal(req, res) {
    const { x, y, yaw } = req.body;

    if (![x, y, yaw].every(v => typeof v === 'number')) {
        return res.status(400).json({
            status: 'fail',
            error: {
                code: 'INVALID_INPUT',
                message: 'x, y, yaw must be numbers',
            },
            meta: { timestamp: timestamper() },
        });
    }
    try {
        // Service handles the logic and throws if robot is busy
        GoalService.sendGoal({ x, y, yaw });
        
        return res.status(200).json({
            status: 'success',
            data: { x, y, yaw, status: 'PENDING' },
            meta: { timestamp: timestamper() },
        });
    } catch (error) {
        logger.error('[GoalController] Failed to set goal:', error);
        return res.status(500).json({
            status: 'fail',
            error: {
                code: 'GOAL_SEND_ERROR',
                message: 'Failed to send navigation goal',
                detail: error.message,
            },
            meta: { timestamp: timestamper() },
        });
    }
}

export async function getGoal(req, res) {
    try {
        const { status, goal } = GoalService.getGoal();
        const { feedback } = GoalService.getFeedback();

        if (!status.isActive) {
            return res.status(404).json({
                status: 'fail',
                error: {
                    status,
                    code: 'NO_ACTIVE_GOAL',
                    message: 'There is no active navigation goal',
                },
                meta: { timestamp: timestamper() },
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                goal,
                status,
                feedback,
            },
            meta: { timestamp: timestamper() },
        });
    } catch (error) {
        logger.error('[GoalController] Failed to get current goal:', error);
        return res.status(500).json({
            status: 'fail',
            error: {
                code: 'GOAL_FETCH_ERROR',
                message: 'Failed to retrieve current navigation goal',
                detail: error.message,
            },
            meta: { timestamp: timestamper() },
        });
    }
}

export async function cancelGoal(req, res) {
    try {
        const canceled = await GoalService.cancelGoal();

        if (!canceled) {
            return res.status(409).json({
                status: 'fail',
                error: {
                    code: 'NO_ACTIVE_GOAL',
                    message: 'There is no active goal to cancel',
                },
                meta: { timestamp: timestamper() },
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                canceled: true,
                message: 'Cancellation signal sent'
            },
            meta: { timestamp: timestamper() },
        });
    } catch (error) {
        logger.error('[GoalController] Failed to cancel goal:', error);
        return res.status(500).json({
            status: 'fail',
            error: {
                code: 'GOAL_CANCEL_ERROR',
                message: 'Failed to cancel current navigation goal',
                detail: error.message,
            },
            meta: { timestamp: timestamper() },
        });
    }
}