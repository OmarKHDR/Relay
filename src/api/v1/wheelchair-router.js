import Router from "express";
import { getWheelchairDirection, setWheelchairDirection } from "#controllers/wheelchairCotnroller.js";

const wheelchairRouter = Router();

wheelchairRouter.post('/direction/', setWheelchairDirection)
wheelchairRouter.get('/direction/', getWheelchairDirection)


export default wheelchairRouter;