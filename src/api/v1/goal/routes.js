import {Router} from 'express';
import {
    getGoal,
    cancelGoal,
    setGoal,
} from '#modules/goal/goalController.js';

const goalRouter = Router();

// goal routes
goalApi.get('/goal', getGoal);
goalApi.post('/goal', setGoal);
goalApi.delete('/goal', cancelGoal);

export default goalRouter;
