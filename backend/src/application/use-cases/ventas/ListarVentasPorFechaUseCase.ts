import { Venta } from '../../../domain/entities/Venta';
import { VentaRepository } from '../../../domain/ports/repositories/VentaRepository';

export interface ListarVentasPorFechaComando {
  tiendaId: string;
  desde: Date;
  hasta: Date;
}

export class ListarVentasPorFechaUseCase {
  constructor(private readonly repositorioVentas: VentaRepository) {}

  async ejecutar(comando: ListarVentasPorFechaComando): Promise<Venta[]> {
    return this.repositorioVentas.listarPorRangoFechas(
      comando.tiendaId,
      comando.desde,
      comando.hasta,
    );
  }
}
