import { Router } from 'express';
import { getCategories, getBrands, getModels } from './irdb.controller.js';

const irdbRouter = Router();

irdbRouter.get('/irdb/categories', getCategories);
irdbRouter.get('/irdb/:category/brands', getBrands);
irdbRouter.get('/irdb/:category/:brand/models', getModels);

export default irdbRouter;
