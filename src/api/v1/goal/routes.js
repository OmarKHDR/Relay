import {Router} from 'express';
import {
    getGoal,
    cancelGoal,
    setGoal,
} from './goal.controller.js';

const goalRouter = Router();

// goal routes
goalRouter.get('/goal', getGoal);
goalRouter.post('/goal', setGoal);
goalRouter.delete('/goal', cancelGoal);

export default goalRouter;
