import Router from "express";
import { getWheelchairDirection, setWheelchairDirection } from "#controllers/wheelchairCotnroller.js";

const wheelchairRouter = Router();

wheelchairRouter.post('/move/', setWheelchairDirection)
wheelchairRouter.get('/move/', getWheelchairDirection)


export default wheelchairRouter;