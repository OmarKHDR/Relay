import {Router} from 'express';
import {
    getGoal,
    cancelGoal,
    setGoal,
} from '#modules/goal/goalController.js';

const goalApi = Router();

// goal routes
goalApi.get('/goal', getGoal);
goalApi.post('/goal', setGoal);
goalApi.delete('/goal', cancelGoal);

export default goalApi;
