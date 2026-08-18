import { Tienda } from '../../entities/Tienda';

export interface TiendaRepository {
  guardar(tienda: Tienda): Promise<Tienda>;
  buscarPorId(id: string): Promise<Tienda | null>;
}
