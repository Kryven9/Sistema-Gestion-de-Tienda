import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GenerarReporteUseCase } from '../../../application/use-cases/reportes/GenerarReporteUseCase';
import { ListarProductosStockBajoUseCase } from '../../../application/use-cases/reportes/ListarProductosStockBajoUseCase';
import { CalculadorPeriodoReporte } from '../../../application/use-cases/reportes/CalculadorPeriodoReporte';
import { TipoReporte } from '../../../domain/entities/Reporte';

const esquemaReporte = z.object({
  tipo: z.enum(['DIA', 'SEMANA', 'MES', 'RANGO']).optional().default('DIA'),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
  limiteMasVendidos: z.coerce.number().int().min(1).max(50).optional(),
});

const esquemaStockBajo = z.object({
  umbral: z.coerce.number().int().min(0).optional(),
});

export class ReportesController {
  constructor(
    private readonly generarReporteUseCase: GenerarReporteUseCase,
    private readonly listarProductosStockBajoUseCase: ListarProductosStockBajoUseCase,
  ) {}

  async generarReporte(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaReporte.parse(req.query);
      const tipo: TipoReporte = datos.tipo;

      let desde: Date;
      let hasta: Date;

      if (tipo === 'RANGO' && datos.desde && datos.hasta) {
        desde = new Date(datos.desde);
        hasta = new Date(datos.hasta);
      } else {
        const periodo = CalculadorPeriodoReporte.para(tipo);
        desde = periodo.desde;
        hasta = periodo.hasta;
      }

      const reporte = await this.generarReporteUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        tipo,
        desde,
        hasta,
        limiteMasVendidos: datos.limiteMasVendidos,
      });
      res.json(reporte);
    } catch (error) {
      next(error);
    }
  }

  async stockBajo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaStockBajo.parse(req.query);
      const productos = await this.listarProductosStockBajoUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        umbral: datos.umbral,
      });
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }
}
