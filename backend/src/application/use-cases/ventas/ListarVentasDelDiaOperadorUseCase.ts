import { Venta } from '../../../domain/entities/Venta';
import { VentaRepository } from '../../../domain/ports/repositories/VentaRepository';

export interface ListarVentasDelDiaOperadorComando {
  usuarioId: string;
  tiendaId: string;
}

export class ListarVentasDelDiaOperadorUseCase {
  constructor(private readonly repositorioVentas: VentaRepository) {}

  async ejecutar(comando: ListarVentasDelDiaOperadorComando): Promise<Venta[]> {
    return this.repositorioVentas.listarPorUsuarioYFecha(
      comando.usuarioId,
      comando.tiendaId,
      new Date(),
    );
  }
}
