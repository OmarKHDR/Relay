import Router from 'express'
const apiRouter = Router();

apiRouter.get('/status', (req, res) => {res.send({});})


export default apiRouter;