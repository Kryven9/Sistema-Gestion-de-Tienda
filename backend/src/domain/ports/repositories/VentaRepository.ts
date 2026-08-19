import { Venta } from '../../entities/Venta';
import { DetalleVenta } from '../../entities/DetalleVenta';
import { ProductoVendido } from '../../entities/Reporte';

export interface LineaVendida {
  productoId: string;
  nombre: string;
  cantidad: number;
  subtotal: number;
}

export interface VentaRepository {
  guardar(venta: Venta, detalles: DetalleVenta[]): Promise<Venta>;
  buscarPorId(id: string, tiendaId: string): Promise<(Venta & { detalles: DetalleVenta[] }) | null>;
  listarPorRangoFechas(tiendaId: string, desde: Date, hasta: Date): Promise<Venta[]>;
  listarPorUsuarioYFecha(usuarioId: string, tiendaId: string, fecha: Date): Promise<Venta[]>;
  anular(id: string, tiendaId: string): Promise<void>;
  listarLineasVendidasPorRango(tiendaId: string, desde: Date, hasta: Date): Promise<LineaVendida[]>;
  contarProductosMasVendidos(
    tiendaId: string,
    desde: Date,
    hasta: Date,
    limite: number,
  ): Promise<ProductoVendido[]>;
}
