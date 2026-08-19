import { Router } from 'express';
import { ReportesController } from '../controllers/ReportesController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function crearRutasReportes(controller: ReportesController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', (req, res, next) => controller.generarReporte(req, res, next));
  router.get('/stock-bajo', (req, res, next) => controller.stockBajo(req, res, next));

  return router;
}
