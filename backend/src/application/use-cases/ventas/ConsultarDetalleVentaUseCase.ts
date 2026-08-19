import { Venta } from '../../../domain/entities/Venta';
import { DetalleVenta } from '../../../domain/entities/DetalleVenta';
import { VentaRepository } from '../../../domain/ports/repositories/VentaRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface ConsultarDetalleVentaComando {
  ventaId: string;
  tiendaId: string;
  usuarioId: string;
  esDueno: boolean;
}

export class ConsultarDetalleVentaUseCase {
  constructor(private readonly repositorioVentas: VentaRepository) {}

  async ejecutar(
    comando: ConsultarDetalleVentaComando,
  ): Promise<Venta & { detalles: DetalleVenta[] }> {
    const venta = await this.repositorioVentas.buscarPorId(comando.ventaId, comando.tiendaId);

    if (!venta) {
      throw new EntidadNoEncontradaError('Venta', comando.ventaId);
    }

    if (!comando.esDueno && venta.usuarioId !== comando.usuarioId) {
      throw new EntidadNoEncontradaError('Venta', comando.ventaId);
    }

    return venta;
  }
}
