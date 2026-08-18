import { Tienda } from '@domain/entities/Tienda';
import { TiendaRepository } from '@domain/ports/repositories/TiendaRepository';

export class FakeTiendaRepository implements TiendaRepository {
  private tiendas: Map<string, Tienda> = new Map();

  async guardar(tienda: Tienda): Promise<Tienda> {
    this.tiendas.set(tienda.id, { ...tienda });
    return tienda;
  }

  async buscarPorId(id: string): Promise<Tienda | null> {
    return this.tiendas.get(id) ?? null;
  }
}
