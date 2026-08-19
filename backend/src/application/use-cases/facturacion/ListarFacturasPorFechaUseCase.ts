import { Factura } from '../../../domain/entities/Factura';
import { FacturaRepository } from '../../../domain/ports/repositories/FacturaRepository';

export interface ListarFacturasPorFechaComando {
  tiendaId: string;
  desde: Date;
  hasta: Date;
}

export class ListarFacturasPorFechaUseCase {
  constructor(private readonly repositorioFacturas: FacturaRepository) {}

  async ejecutar(comando: ListarFacturasPorFechaComando): Promise<Factura[]> {
    return this.repositorioFacturas.listarPorRangoFechas(
      comando.tiendaId,
      comando.desde,
      comando.hasta,
    );
  }
}
