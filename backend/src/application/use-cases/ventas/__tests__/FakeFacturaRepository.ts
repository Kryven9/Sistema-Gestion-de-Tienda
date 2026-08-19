import { Factura } from '../../../../domain/entities/Factura';
import { FacturaRepository } from '../../../../domain/ports/repositories/FacturaRepository';
import { EstadoFactura } from '../../../../domain/enums/EstadoFactura';

export class FakeFacturaRepository implements FacturaRepository {
  private facturas: Map<string, Factura> = new Map();

  async guardar(factura: Factura): Promise<Factura> {
    this.facturas.set(factura.id, { ...factura });
    return factura;
  }

  async buscarPorVentaId(ventaId: string, tiendaId: string): Promise<Factura | null> {
    for (const f of this.facturas.values()) {
      if (f.ventaId === ventaId && f.tiendaId === tiendaId) return { ...f };
    }
    return null;
  }

  async buscarPorId(id: string, tiendaId: string): Promise<Factura | null> {
    const factura = this.facturas.get(id);
    if (!factura || factura.tiendaId !== tiendaId) return null;
    return { ...factura };
  }

  async listarPorRangoFechas(tiendaId: string, desde: Date, hasta: Date): Promise<Factura[]> {
    return [...this.facturas.values()].filter(
      (f) => f.tiendaId === tiendaId && f.fechaEmision >= desde && f.fechaEmision <= hasta,
    );
  }

  async anular(id: string, tiendaId: string): Promise<void> {
    const factura = this.facturas.get(id);
    if (factura && factura.tiendaId === tiendaId) {
      factura.estado = EstadoFactura.ANULADA;
    }
  }
}
