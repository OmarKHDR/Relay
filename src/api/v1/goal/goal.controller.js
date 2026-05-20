import GoalService from './goal.service.js';

export async function setGoal(req, res) {
    const { x, y, yaw } = req.body;
    // Service handles the logic and throws if robot is busy
    const goalID = GoalService.sendGoal({ x, y, yaw });

    return { goalID };
}

export async function getFeedback(req, res) {
    return GoalService.getFeedback();
}

export async function getGoal(req, res) {
    return GoalService.getGoal();
}

export async function cancelGoal(req, res) {
    const canceled = await GoalService.cancelGoal();

    if (!canceled) throw new Error('no active goal to cancel');
    return {
        canceled: true,
    };
}
