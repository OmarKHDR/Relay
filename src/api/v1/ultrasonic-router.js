import Router from "express";
import { getDistance } from "#controllers/ultrasonicController.js";

const ultrasonicRouter = Router();

ultrasonicRouter.get('/', getDistance)


export default ultrasonicRouter;