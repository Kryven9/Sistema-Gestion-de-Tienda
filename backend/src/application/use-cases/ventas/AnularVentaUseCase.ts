import { VentaRepository } from '../../../domain/ports/repositories/VentaRepository';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { FacturaRepository } from '../../../domain/ports/repositories/FacturaRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface AnularVentaComando {
  ventaId: string;
  tiendaId: string;
}

export class AnularVentaUseCase {
  constructor(
    private readonly repositorioVentas: VentaRepository,
    private readonly repositorioProductos: ProductoRepository,
    private readonly repositorioFacturas: FacturaRepository,
  ) {}

  async ejecutar(comando: AnularVentaComando): Promise<void> {
    const venta = await this.repositorioVentas.buscarPorId(comando.ventaId, comando.tiendaId);

    if (!venta) {
      throw new EntidadNoEncontradaError('Venta', comando.ventaId);
    }

    if (venta.anulada) {
      throw new Error('La venta ya está anulada');
    }

    for (const detalle of venta.detalles) {
      await this.repositorioProductos.actualizarStock(
        detalle.productoId,
        comando.tiendaId,
        detalle.cantidad,
      );
    }

    await this.repositorioVentas.anular(comando.ventaId, comando.tiendaId);

    const factura = await this.repositorioFacturas.buscarPorVentaId(
      comando.ventaId,
      comando.tiendaId,
    );

    if (factura) {
      await this.repositorioFacturas.anular(factura.id, comando.tiendaId);
    }
  }
}
