import Router from 'express'
import { getVelocity, updateVelocity } from "#src/api/v1/wheelchair/wheelchairCotnroller.js";

const wheelchairApi = Router();


// wheelchair
wheelchairApi.post('/wheelchair/velocity/', updateVelocity);
wheelchairApi.get('/wheelchair/velocity/', getVelocity);


export default wheelchairApi;