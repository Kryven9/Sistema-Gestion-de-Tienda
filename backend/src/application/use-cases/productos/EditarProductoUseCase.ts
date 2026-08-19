import { Producto } from '../../../domain/entities/Producto';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';
import { ValorInvalidoError } from '../../../domain/errors/ValorInvalidoError';

export interface EditarProductoComando {
  productoId: string;
  tiendaId: string;
  nombre?: string;
  precio?: number;
  categoria?: string;
}

export class EditarProductoUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: EditarProductoComando): Promise<Producto> {
    const existente = await this.repositorioProductos.buscarPorId(
      comando.productoId,
      comando.tiendaId,
    );

    if (!existente) {
      throw new EntidadNoEncontradaError('Producto', comando.productoId);
    }

    const datos: Partial<Pick<Producto, 'nombre' | 'precio' | 'categoria'>> = {};

    if (comando.nombre !== undefined) {
      datos.nombre = comando.nombre;
    }

    if (comando.precio !== undefined) {
      if (comando.precio < 0) {
        throw new ValorInvalidoError('precio', comando.precio);
      }
      datos.precio = comando.precio;
    }

    if (comando.categoria !== undefined) {
      datos.categoria = comando.categoria;
    }

    return this.repositorioProductos.actualizar(comando.productoId, comando.tiendaId, datos);
  }
}
