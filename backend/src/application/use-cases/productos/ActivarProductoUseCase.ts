import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface ActivarProductoComando {
  productoId: string;
  tiendaId: string;
}

export class ActivarProductoUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: ActivarProductoComando): Promise<void> {
    const existente = await this.repositorioProductos.buscarPorId(
      comando.productoId,
      comando.tiendaId,
    );

    if (!existente) {
      throw new EntidadNoEncontradaError('Producto', comando.productoId);
    }

    await this.repositorioProductos.activar(comando.productoId, comando.tiendaId);
  }
}
