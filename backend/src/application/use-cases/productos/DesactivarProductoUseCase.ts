import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface DesactivarProductoComando {
  productoId: string;
  tiendaId: string;
}

export class DesactivarProductoUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: DesactivarProductoComando): Promise<void> {
    const existente = await this.repositorioProductos.buscarPorId(
      comando.productoId,
      comando.tiendaId,
    );

    if (!existente) {
      throw new EntidadNoEncontradaError('Producto', comando.productoId);
    }

    await this.repositorioProductos.desactivar(comando.productoId, comando.tiendaId);
  }
}
