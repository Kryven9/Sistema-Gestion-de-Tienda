import { PrismaClient } from '@prisma/client';
import { Factura } from '../../../domain/entities/Factura';
import { FacturaRepository } from '../../../domain/ports/repositories/FacturaRepository';
import { EstadoFactura } from '../../../domain/enums/EstadoFactura';

export class PrismaFacturaRepository implements FacturaRepository {
  constructor(private prisma: PrismaClient) {}

  private aEntidad(row: {
    id: string;
    tiendaId: string;
    ventaId: string;
    folio: string;
    total: import('@prisma/client').Prisma.Decimal;
    estado: string;
    leyenda: string;
    fechaEmision: Date;
  }): Factura {
    return {
      id: row.id,
      tiendaId: row.tiendaId,
      ventaId: row.ventaId,
      folio: row.folio,
      total: Number(row.total),
      estado: row.estado as EstadoFactura,
      leyenda: row.leyenda,
      fechaEmision: row.fechaEmision,
    };
  }

  async guardar(factura: Factura): Promise<Factura> {
    const guardada = await this.prisma.factura.create({
      data: {
        id: factura.id,
        tiendaId: factura.tiendaId,
        ventaId: factura.ventaId,
        folio: factura.folio,
        total: factura.total,
        estado: factura.estado,
        leyenda: factura.leyenda,
        fechaEmision: factura.fechaEmision,
      },
    });
    return this.aEntidad(guardada);
  }

  async buscarPorVentaId(ventaId: string, tiendaId: string): Promise<Factura | null> {
    const factura = await this.prisma.factura.findFirst({
      where: { ventaId, tiendaId },
    });
    if (!factura) return null;
    return this.aEntidad(factura);
  }

  async buscarPorId(id: string, tiendaId: string): Promise<Factura | null> {
    const factura = await this.prisma.factura.findFirst({
      where: { id, tiendaId },
    });
    if (!factura) return null;
    return this.aEntidad(factura);
  }

  async listarPorRangoFechas(tiendaId: string, desde: Date, hasta: Date): Promise<Factura[]> {
    const facturas = await this.prisma.factura.findMany({
      where: {
        tiendaId,
        fechaEmision: { gte: desde, lte: hasta },
      },
      orderBy: { fechaEmision: 'desc' },
    });
    return facturas.map((f) => this.aEntidad(f));
  }

  async anular(id: string, tiendaId: string): Promise<void> {
    await this.prisma.factura.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: { estado: 'ANULADA' },
    });
  }
}
