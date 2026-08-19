import { Producto } from '../../../domain/entities/Producto';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';

export interface BuscarProductosComando {
  tiendaId: string;
  nombre: string;
}

export class BuscarProductosUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: BuscarProductosComando): Promise<Producto[]> {
    return this.repositorioProductos.buscarPorNombre(comando.tiendaId, comando.nombre);
  }
}
