import { Producto } from '../../../domain/entities/Producto';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';

export interface ListarProductosComando {
  tiendaId: string;
}

export class ListarProductosUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: ListarProductosComando): Promise<Producto[]> {
    return this.repositorioProductos.listarPorTienda(comando.tiendaId);
  }
}
