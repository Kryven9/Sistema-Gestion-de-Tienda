import { Venta } from '../../../../domain/entities/Venta';
import { DetalleVenta } from '../../../../domain/entities/DetalleVenta';
import { VentaRepository } from '../../../../domain/ports/repositories/VentaRepository';

export class FakeVentaRepository implements VentaRepository {
  private ventas: Map<string, Venta> = new Map();
  private detalles: Map<string, DetalleVenta[]> = new Map();

  async guardar(venta: Venta, detalles: DetalleVenta[]): Promise<Venta> {
    this.ventas.set(venta.id, { ...venta });
    this.detalles.set(
      venta.id,
      detalles.map((d) => ({ ...d })),
    );
    return venta;
  }

  async buscarPorId(
    id: string,
    tiendaId: string,
  ): Promise<(Venta & { detalles: DetalleVenta[] }) | null> {
    const venta = this.ventas.get(id);
    if (!venta || venta.tiendaId !== tiendaId) return null;
    const detallesVenta = this.detalles.get(id) ?? [];
    return { ...venta, detalles: detallesVenta };
  }

  async listarPorRangoFechas(tiendaId: string, desde: Date, hasta: Date): Promise<Venta[]> {
    return [...this.ventas.values()].filter(
      (v) => v.tiendaId === tiendaId && v.fecha >= desde && v.fecha <= hasta,
    );
  }

  async listarPorUsuarioYFecha(usuarioId: string, tiendaId: string, fecha: Date): Promise<Venta[]> {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    return [...this.ventas.values()].filter(
      (v) =>
        v.usuarioId === usuarioId &&
        v.tiendaId === tiendaId &&
        v.fecha >= inicioDia &&
        v.fecha <= finDia,
    );
  }

  async anular(id: string, tiendaId: string): Promise<void> {
    const venta = this.ventas.get(id);
    if (venta && venta.tiendaId === tiendaId) {
      venta.anulada = true;
    }
  }
}
