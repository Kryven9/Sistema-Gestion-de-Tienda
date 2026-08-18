import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function crearRutasAuth(controller: AuthController): Router {
  const router = Router();

  router.post('/registro', (req, res, next) => controller.registrar(req, res, next));
  router.post('/login', (req, res, next) => controller.login(req, res, next));
  router.post('/logout', authMiddleware, (req, res) => controller.logout(req, res));
  router.post('/cambiar-password', authMiddleware, (req, res, next) =>
    controller.cambiarPassword(req, res, next),
  );
  router.get('/perfil', authMiddleware, (req, res, next) => controller.perfil(req, res, next));

  return router;
}
