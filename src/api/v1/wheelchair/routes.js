import { Router } from 'express';
import { getVelocity, updateVelocity } from '#src/api/v1/wheelchair/wheelchairController.js';

const wheelchairRouter = Router();

// wheelchair
wheelchairRouter.post('/wheelchair/velocity/', updateVelocity);
wheelchairRouter.get('/wheelchair/velocity/', getVelocity);

export default wheelchairRouter;
