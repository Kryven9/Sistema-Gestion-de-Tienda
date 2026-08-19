import { Producto } from '../../../domain/entities/Producto';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';

export interface FiltrarPorCategoriaComando {
  tiendaId: string;
  categoria: string;
}

export class FiltrarPorCategoriaUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: FiltrarPorCategoriaComando): Promise<Producto[]> {
    return this.repositorioProductos.listarPorCategoria(comando.tiendaId, comando.categoria);
  }
}
