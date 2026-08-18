import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CrearOperadorUseCase } from '../../../application/use-cases/usuarios/CrearOperadorUseCase';
import { EditarOperadorUseCase } from '../../../application/use-cases/usuarios/EditarOperadorUseCase';
import { DesactivarOperadorUseCase } from '../../../application/use-cases/usuarios/DesactivarOperadorUseCase';
import { ActivarOperadorUseCase } from '../../../application/use-cases/usuarios/ActivarOperadorUseCase';
import { ListarOperadoresUseCase } from '../../../application/use-cases/usuarios/ListarOperadoresUseCase';

const esquemaCrearOperador = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  correo: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const esquemaEditarOperador = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
});

export class UsuariosController {
  constructor(
    private crearOperadorUseCase: CrearOperadorUseCase,
    private editarOperadorUseCase: EditarOperadorUseCase,
    private desactivarOperadorUseCase: DesactivarOperadorUseCase,
    private activarOperadorUseCase: ActivarOperadorUseCase,
    private listarOperadoresUseCase: ListarOperadoresUseCase,
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaCrearOperador.parse(req.body);
      const resultado = await this.crearOperadorUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        ...datos,
      });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async editar(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const datos = esquemaEditarOperador.parse(req.body);
      const resultado = await this.editarOperadorUseCase.ejecutar({
        usuarioId: id,
        tiendaId: req.usuario!.tiendaId,
        ...datos,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async desactivar(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.desactivarOperadorUseCase.ejecutar({
        usuarioId: id,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json({ message: 'Usuario desactivado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async activar(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.activarOperadorUseCase.ejecutar({
        usuarioId: id,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json({ message: 'Usuario activado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.listarOperadoresUseCase.ejecutar({
        tiendaId: _req.usuario!.tiendaId,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}
