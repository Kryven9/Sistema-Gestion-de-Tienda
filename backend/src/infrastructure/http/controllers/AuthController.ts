import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegistrarTiendaUseCase } from '../../../application/use-cases/auth/RegistrarTiendaUseCase';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { CambiarPasswordUseCase } from '../../../application/use-cases/auth/CambiarPasswordUseCase';

const esquemaRegistro = z.object({
  nombreTienda: z.string().min(1, 'El nombre de la tienda es obligatorio'),
  nombreUsuario: z.string().min(1, 'El nombre del usuario es obligatorio'),
  correo: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const esquemaLogin = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const esquemaCambiarPassword = z.object({
  passwordActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  passwordNueva: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export class AuthController {
  constructor(
    private registrarTiendaUseCase: RegistrarTiendaUseCase,
    private loginUseCase: LoginUseCase,
    private cambiarPasswordUseCase: CambiarPasswordUseCase,
  ) {}

  async registrar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaRegistro.parse(req.body);
      const resultado = await this.registrarTiendaUseCase.ejecutar(datos);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaLogin.parse(req.body);
      const resultado = await this.loginUseCase.ejecutar(datos);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async cambiarPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaCambiarPassword.parse(req.body);
      await this.cambiarPasswordUseCase.ejecutar({
        usuarioId: req.usuario!.userId,
        tiendaId: req.usuario!.tiendaId,
        ...datos,
      });
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  logout(_req: Request, res: Response): void {
    res.json({ message: 'Sesión cerrada correctamente' });
  }

  async perfil(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ usuario: req.usuario });
    } catch (error) {
      next(error);
    }
  }
}
