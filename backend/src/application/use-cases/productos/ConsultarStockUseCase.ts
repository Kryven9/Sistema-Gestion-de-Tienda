import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface ConsultarStockComando {
  productoId: string;
  tiendaId: string;
}

export interface ConsultarStockResultado {
  productoId: string;
  nombre: string;
  stock: number;
}

export class ConsultarStockUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: ConsultarStockComando): Promise<ConsultarStockResultado> {
    const producto = await this.repositorioProductos.buscarPorId(
      comando.productoId,
      comando.tiendaId,
    );

    if (!producto) {
      throw new EntidadNoEncontradaError('Producto', comando.productoId);
    }

    return {
      productoId: producto.id,
      nombre: producto.nombre,
      stock: producto.stock,
    };
  }
}
