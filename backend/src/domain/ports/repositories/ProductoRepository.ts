import { Producto } from '../../entities/Producto';

export interface ProductoRepository {
  guardar(producto: Producto): Promise<Producto>;
  buscarPorId(id: string, tiendaId: string): Promise<Producto | null>;
  buscarPorNombre(tiendaId: string, nombre: string): Promise<Producto[]>;
  listarPorTienda(tiendaId: string): Promise<Producto[]>;
  actualizarStock(id: string, tiendaId: string, cantidad: number): Promise<void>;
}
