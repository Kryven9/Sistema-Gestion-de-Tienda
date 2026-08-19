import { Factura } from '../../../domain/entities/Factura';
import { FacturaRepository } from '../../../domain/ports/repositories/FacturaRepository';

export interface ConsultarFacturaPorVentaComando {
  ventaId: string;
  tiendaId: string;
}

export class ConsultarFacturaPorVentaUseCase {
  constructor(private readonly repositorioFacturas: FacturaRepository) {}

  async ejecutar(comando: ConsultarFacturaPorVentaComando): Promise<Factura> {
    const factura = await this.repositorioFacturas.buscarPorVentaId(
      comando.ventaId,
      comando.tiendaId,
    );

    if (!factura) {
      throw new Error('La venta no tiene una factura asociada');
    }

    return factura;
  }
}
