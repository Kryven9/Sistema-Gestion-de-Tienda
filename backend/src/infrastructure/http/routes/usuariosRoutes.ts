import { Router } from 'express';
import { UsuariosController } from '../controllers/UsuariosController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

export function crearRutasUsuarios(controller: UsuariosController): Router {
  const router = Router();

  router.use(authMiddleware);
  router.use(requireRole('DUENO'));

  router.get('/', (req, res, next) => controller.listar(req, res, next));
  router.post('/', (req, res, next) => controller.crear(req, res, next));
  router.put('/:id', (req, res, next) => controller.editar(req, res, next));
  router.patch('/:id/activar', (req, res, next) => controller.activar(req, res, next));
  router.delete('/:id', (req, res, next) => controller.desactivar(req, res, next));

  return router;
}
