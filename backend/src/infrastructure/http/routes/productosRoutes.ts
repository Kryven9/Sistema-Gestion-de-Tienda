import { Router } from 'express';
import { ProductosController } from '../controllers/ProductosController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function crearRutasProductos(controller: ProductosController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', (req, res, next) => controller.listar(req, res, next));
  router.get('/buscar', (req, res, next) => controller.buscar(req, res, next));
  router.get('/categoria', (req, res, next) => controller.filtrarPorCategoria(req, res, next));
  router.get('/:id/stock', (req, res, next) => controller.consultarStock(req, res, next));
  router.post('/', (req, res, next) => controller.crear(req, res, next));
  router.put('/:id', (req, res, next) => controller.editar(req, res, next));
  router.patch('/:id/activar', (req, res, next) => controller.activar(req, res, next));
  router.delete('/:id', (req, res, next) => controller.desactivar(req, res, next));

  return router;
}
