import { Venta } from '../../../../domain/entities/Venta';
import { DetalleVenta } from '../../../../domain/entities/DetalleVenta';
import { ProductoVendido } from '../../../../domain/entities/Reporte';
import {
  LineaVendida,
  VentaRepository,
} from '../../../../domain/ports/repositories/VentaRepository';

export interface LineaVendidaConNombre extends LineaVendida {
  nombre: string;
}

export class FakeVentaRepository implements VentaRepository {
  private ventas: Map<string, Venta> = new Map();
  private detalles: Map<string, DetalleVenta[]> = new Map();
  public lineasCargadas: LineaVendidaConNombre[] = [];
  public masVendidos: ProductoVendido[] = [];

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

  async listarLineasVendidasPorRango(
    tiendaId: string,
    desde: Date,
    hasta: Date,
  ): Promise<LineaVendida[]> {
    return this.lineasCargadas
      .filter(() => tiendaId && desde && hasta)
      .map(({ productoId, nombre, cantidad, subtotal }) => ({
        productoId,
        nombre,
        cantidad,
        subtotal,
      }));
  }

  async contarProductosMasVendidos(
    tiendaId: string,
    desde: Date,
    hasta: Date,
    limite: number,
  ): Promise<ProductoVendido[]> {
    return this.masVendidos.slice(0, limite);
  }

  agregarLinea(linea: LineaVendidaConNombre) {
    this.lineasCargadas.push(linea);
  }

  agregarMasVendido(producto: ProductoVendido) {
    this.masVendidos.push(producto);
  }
}
