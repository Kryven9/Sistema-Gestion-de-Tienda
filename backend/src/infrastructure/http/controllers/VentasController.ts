import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegistrarVentaUseCase } from '../../../application/use-cases/ventas/RegistrarVentaUseCase';
import { ConsultarDetalleVentaUseCase } from '../../../application/use-cases/ventas/ConsultarDetalleVentaUseCase';
import { ListarVentasPorFechaUseCase } from '../../../application/use-cases/ventas/ListarVentasPorFechaUseCase';
import { ListarVentasDelDiaOperadorUseCase } from '../../../application/use-cases/ventas/ListarVentasDelDiaOperadorUseCase';
import { AnularVentaUseCase } from '../../../application/use-cases/ventas/AnularVentaUseCase';
import { OrigenVenta } from '../../../domain/enums/OrigenVenta';

const esquemaRegistrarVenta = z.object({
  items: z
    .array(
      z.object({
        productoId: z.string().min(1),
        cantidad: z.number().int().positive(),
      }),
    )
    .min(1, 'Debe haber al menos un producto'),
  origen: z.nativeEnum(OrigenVenta).optional(),
});

const esquemaRangoFechas = z.object({
  desde: z.string().datetime(),
  hasta: z.string().datetime(),
});

export class VentasController {
  constructor(
    private registrarVentaUseCase: RegistrarVentaUseCase,
    private consultarDetalleVentaUseCase: ConsultarDetalleVentaUseCase,
    private listarVentasPorFechaUseCase: ListarVentasPorFechaUseCase,
    private listarVentasDelDiaOperadorUseCase: ListarVentasDelDiaOperadorUseCase,
    private anularVentaUseCase: AnularVentaUseCase,
  ) {}

  async registrar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaRegistrarVenta.parse(req.body);
      const resultado = await this.registrarVentaUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        usuarioId: req.usuario!.userId,
        ...datos,
      });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async consultarDetalle(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const resultado = await this.consultarDetalleVentaUseCase.ejecutar({
        ventaId: id,
        tiendaId: req.usuario!.tiendaId,
        usuarioId: req.usuario!.userId,
        esDueno: req.usuario!.rol === 'DUENO',
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listarPorFecha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaRangoFechas.parse(req.query);
      const resultado = await this.listarVentasPorFechaUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        desde: new Date(datos.desde),
        hasta: new Date(datos.hasta),
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listarDelDiaOperador(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.listarVentasDelDiaOperadorUseCase.ejecutar({
        usuarioId: req.usuario!.userId,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async anular(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.anularVentaUseCase.ejecutar({
        ventaId: id,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json({ message: 'Venta anulada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}
