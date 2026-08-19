import { Producto } from '../../entities/Producto';

export interface ProductoRepository {
  guardar(producto: Producto): Promise<Producto>;
  buscarPorId(id: string, tiendaId: string): Promise<Producto | null>;
  buscarPorNombre(tiendaId: string, nombre: string): Promise<Producto[]>;
  listarPorTienda(tiendaId: string): Promise<Producto[]>;
  listarPorCategoria(tiendaId: string, categoria: string): Promise<Producto[]>;
  actualizar(
    id: string,
    tiendaId: string,
    datos: Partial<Pick<Producto, 'nombre' | 'precio' | 'categoria'>>,
  ): Promise<Producto>;
  activar(id: string, tiendaId: string): Promise<void>;
  desactivar(id: string, tiendaId: string): Promise<void>;
  actualizarStock(id: string, tiendaId: string, cantidad: number): Promise<void>;
}
