import { Reporte, ResumenVentas, TipoReporte } from '../../../domain/entities/Reporte';
import { VentaRepository } from '../../../domain/ports/repositories/VentaRepository';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';

export interface GenerarReporteComando {
  tiendaId: string;
  tipo: TipoReporte;
  desde: Date;
  hasta: Date;
  limiteMasVendidos?: number;
}

export class GenerarReporteUseCase {
  constructor(
    private readonly repositorioVentas: VentaRepository,
    private readonly repositorioProductos: ProductoRepository,
  ) {}

  async ejecutar(comando: GenerarReporteComando): Promise<Reporte> {
    const limite = Math.max(1, comando.limiteMasVendidos ?? 5);

    const [ventas, productosMasVendidos, productos] = await Promise.all([
      this.repositorioVentas.listarPorRangoFechas(comando.tiendaId, comando.desde, comando.hasta),
      this.repositorioVentas.contarProductosMasVendidos(
        comando.tiendaId,
        comando.desde,
        comando.hasta,
        limite,
      ),
      this.repositorioProductos.listarPorTienda(comando.tiendaId),
    ]);

    const resumen: ResumenVentas = ventas.reduce<ResumenVentas>(
      (acc, venta) => {
        if (venta.anulada) return acc;
        acc.cantidadVentas += 1;
        acc.totalVentas += 1;
        acc.ingresos += venta.total;
        return acc;
      },
      { totalVentas: 0, cantidadVentas: 0, ingresos: 0 },
    );

    const ventasPorOrigen: Record<'MANUAL' | 'VOZ', number> = { MANUAL: 0, VOZ: 0 };
    ventas.forEach((venta) => {
      if (venta.anulada) return;
      ventasPorOrigen[venta.origen] = (ventasPorOrigen[venta.origen] ?? 0) + 1;
    });

    const nombresProductos = new Map(productos.map((producto) => [producto.id, producto.nombre]));
    const productosMasVendidosConNombre = productosMasVendidos.map((item) => ({
      ...item,
      nombre: item.nombre || nombresProductos.get(item.productoId) || 'Producto',
    }));

    return {
      tiendaId: comando.tiendaId,
      tipo: comando.tipo,
      desde: comando.desde,
      hasta: comando.hasta,
      resumen,
      productosMasVendidos: productosMasVendidosConNombre,
      ventasPorOrigen,
    };
  }
}
