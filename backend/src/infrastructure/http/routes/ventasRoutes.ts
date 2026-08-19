import { Router } from 'express';
import { VentasController } from '../controllers/VentasController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

export function crearRutasVentas(controller: VentasController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.post('/', (req, res, next) => controller.registrar(req, res, next));
  router.get('/mi-dia', (req, res, next) => controller.listarDelDiaOperador(req, res, next));
  router.get('/rango', requireRole('DUENO'), (req, res, next) =>
    controller.listarPorFecha(req, res, next),
  );
  router.get('/:id', (req, res, next) => controller.consultarDetalle(req, res, next));
  router.patch<{ id: string }>('/:id/anular', requireRole('DUENO'), (req, res, next) =>
    controller.anular(req, res, next),
  );

  return router;
}
