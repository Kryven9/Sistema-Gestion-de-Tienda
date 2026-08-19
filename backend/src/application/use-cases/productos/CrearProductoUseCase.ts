import { Producto } from '../../../domain/entities/Producto';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { IdGenerator } from '../../../domain/ports/services/IdGenerator';
import { ValorInvalidoError } from '../../../domain/errors/ValorInvalidoError';

export interface CrearProductoComando {
  tiendaId: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria?: string;
}

export class CrearProductoUseCase {
  constructor(
    private readonly repositorioProductos: ProductoRepository,
    private readonly generadorId: IdGenerator,
  ) {}

  async ejecutar(comando: CrearProductoComando): Promise<Producto> {
    if (comando.precio < 0) {
      throw new ValorInvalidoError('precio', comando.precio);
    }

    if (comando.stock < 0) {
      throw new ValorInvalidoError('stock', comando.stock);
    }

    const producto: Producto = {
      id: this.generadorId.generar(),
      tiendaId: comando.tiendaId,
      nombre: comando.nombre,
      precio: comando.precio,
      stock: comando.stock,
      categoria: comando.categoria ?? null,
      activo: true,
      fechaCreacion: new Date(),
    };

    return this.repositorioProductos.guardar(producto);
  }
}
