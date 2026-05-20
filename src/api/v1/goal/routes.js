import { setGoalDto } from './dto/goal.dto.js';
import { getGoal, cancelGoal, setGoal, getFeedback } from './goal.controller.js';

export const GoalRouter = {
    base: '/goal',
    customRouter: true,
    routes: [
        {
            name: 'getGoal',
            description: 'get current goal',
            method: 'GET',
            path: '/',
            controller: getGoal,
            middlewares: [],
        },
        {
            name: 'cancelGoal',
            description: 'get current goal',
            method: 'DELETE',
            path: '/',
            controller: cancelGoal,
            middlewares: [],
        },
        {
            name: 'getFeedback',
            description: 'get current goal feedback',
            method: 'GET',
            path: '/feedback',
            controller: getFeedback,
            middlewares: [],
        },
        {
            name: 'setGoal',
            description: 'get current goal',
            method: 'POST',
            path: '/',
            dto: setGoalDto,
            controller: setGoal,
            middlewares: [],
        },
    ],
};
