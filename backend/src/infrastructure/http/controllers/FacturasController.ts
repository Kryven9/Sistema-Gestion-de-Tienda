import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ConsultarDetalleFacturaUseCase } from '../../../application/use-cases/facturacion/ConsultarDetalleFacturaUseCase';
import { ListarFacturasPorFechaUseCase } from '../../../application/use-cases/facturacion/ListarFacturasPorFechaUseCase';
import { ConsultarFacturaPorVentaUseCase } from '../../../application/use-cases/facturacion/ConsultarFacturaPorVentaUseCase';

const esquemaRangoFechas = z.object({
  desde: z.string().datetime(),
  hasta: z.string().datetime(),
});

export class FacturasController {
  constructor(
    private consultarDetalleFacturaUseCase: ConsultarDetalleFacturaUseCase,
    private listarFacturasPorFechaUseCase: ListarFacturasPorFechaUseCase,
    private consultarFacturaPorVentaUseCase: ConsultarFacturaPorVentaUseCase,
  ) {}

  async consultarDetalle(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const resultado = await this.consultarDetalleFacturaUseCase.ejecutar({
        facturaId: id,
        tiendaId: req.usuario!.tiendaId,
        usuarioId: req.usuario!.userId,
        esDueno: req.usuario!.rol === 'DUENO',
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async consultarPorVenta(
    req: Request<{ ventaId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { ventaId } = req.params;
      const resultado = await this.consultarFacturaPorVentaUseCase.ejecutar({
        ventaId,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listarPorFecha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaRangoFechas.parse(req.query);
      const resultado = await this.listarFacturasPorFechaUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        desde: new Date(datos.desde),
        hasta: new Date(datos.hasta),
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}
