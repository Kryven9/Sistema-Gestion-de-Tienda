import { Router } from 'express';
import { FacturasController } from '../controllers/FacturasController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function crearRutasFacturas(controller: FacturasController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', (req, res, next) => controller.listarPorFecha(req, res, next));
  router.get('/venta/:ventaId', (req, res, next) => controller.consultarPorVenta(req, res, next));
  router.get('/:id', (req, res, next) => controller.consultarDetalle(req, res, next));

  return router;
}
