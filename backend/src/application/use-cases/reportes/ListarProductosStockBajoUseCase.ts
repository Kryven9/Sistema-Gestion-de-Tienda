import { Producto } from '../../../domain/entities/Producto';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { UMBRAL_STOCK_BAJO_POR_DEFECTO } from '../../../domain/constants/ReporteConstants';

export interface ListarProductosStockBajoComando {
  tiendaId: string;
  umbral?: number;
}

export class ListarProductosStockBajoUseCase {
  constructor(private readonly repositorioProductos: ProductoRepository) {}

  async ejecutar(comando: ListarProductosStockBajoComando): Promise<Producto[]> {
    const umbral = comando.umbral ?? UMBRAL_STOCK_BAJO_POR_DEFECTO;
    const productos = await this.repositorioProductos.listarPorTienda(comando.tiendaId);
    return productos.filter((producto) => producto.activo && producto.stock < umbral);
  }
}
