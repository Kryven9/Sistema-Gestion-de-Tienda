import { Venta } from '../../entities/Venta';
import { DetalleVenta } from '../../entities/DetalleVenta';

export interface VentaRepository {
  guardar(venta: Venta, detalles: DetalleVenta[]): Promise<Venta>;
  buscarPorId(id: string, tiendaId: string): Promise<(Venta & { detalles: DetalleVenta[] }) | null>;
  listarPorRangoFechas(tiendaId: string, desde: Date, hasta: Date): Promise<Venta[]>;
  listarPorUsuarioYFecha(usuarioId: string, tiendaId: string, fecha: Date): Promise<Venta[]>;
  anular(id: string, tiendaId: string): Promise<void>;
}
