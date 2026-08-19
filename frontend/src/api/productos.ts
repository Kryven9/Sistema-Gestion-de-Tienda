import api from './client';

export interface Producto {
  id: string;
  tiendaId: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CrearProductoDto {
  nombre: string;
  precio: number;
  stock: number;
  categoria?: string;
}

export type EditarProductoDto = Partial<Pick<CrearProductoDto, 'nombre' | 'precio' | 'categoria'>>;

export async function listarProductos(): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/productos');
  return data;
}

export async function crearProducto(datos: CrearProductoDto): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', datos);
  return data;
}

export async function editarProducto(id: string, datos: EditarProductoDto): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

export async function desactivarProducto(id: string): Promise<void> {
  await api.delete(`/productos/${id}`);
}

export async function activarProducto(id: string): Promise<void> {
  await api.patch(`/productos/${id}/activar`);
}
