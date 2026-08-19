import { FacturaRepository } from '../../../domain/ports/repositories/FacturaRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';
import { Factura } from '../../../domain/entities/Factura';

export interface ConsultarDetalleFacturaComando {
  facturaId: string;
  tiendaId: string;
  usuarioId: string;
  esDueno: boolean;
}

export class ConsultarDetalleFacturaUseCase {
  constructor(private readonly repositorioFacturas: FacturaRepository) {}

  async ejecutar(comando: ConsultarDetalleFacturaComando): Promise<Factura> {
    const factura = await this.repositorioFacturas.buscarPorId(comando.facturaId, comando.tiendaId);

    if (!factura) {
      throw new EntidadNoEncontradaError('Factura', comando.facturaId);
    }

    return factura;
  }
}
