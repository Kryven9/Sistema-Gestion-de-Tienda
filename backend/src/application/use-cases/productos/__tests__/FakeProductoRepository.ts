import { Producto } from '@domain/entities/Producto';
import { ProductoRepository } from '@domain/ports/repositories/ProductoRepository';

export class FakeProductoRepository implements ProductoRepository {
  private productos: Map<string, Producto> = new Map();

  async guardar(producto: Producto): Promise<Producto> {
    this.productos.set(producto.id, { ...producto });
    return producto;
  }

  async buscarPorId(id: string, tiendaId: string): Promise<Producto | null> {
    for (const p of this.productos.values()) {
      if (p.id === id && p.tiendaId === tiendaId) return { ...p };
    }
    return null;
  }

  async buscarPorNombre(tiendaId: string, nombre: string): Promise<Producto[]> {
    const nombreLower = nombre.toLowerCase();
    return [...this.productos.values()].filter(
      (p) => p.tiendaId === tiendaId && p.nombre.toLowerCase().includes(nombreLower) && p.activo,
    );
  }

  async listarPorTienda(tiendaId: string): Promise<Producto[]> {
    return [...this.productos.values()].filter((p) => p.tiendaId === tiendaId);
  }

  async listarPorCategoria(tiendaId: string, categoria: string): Promise<Producto[]> {
    return [...this.productos.values()].filter(
      (p) => p.tiendaId === tiendaId && p.categoria === categoria && p.activo,
    );
  }

  async actualizar(
    id: string,
    tiendaId: string,
    datos: Partial<Pick<Producto, 'nombre' | 'precio' | 'categoria'>>,
  ): Promise<Producto> {
    for (const p of this.productos.values()) {
      if (p.id === id && p.tiendaId === tiendaId) {
        if (datos.nombre !== undefined) p.nombre = datos.nombre;
        if (datos.precio !== undefined) p.precio = datos.precio;
        if (datos.categoria !== undefined) p.categoria = datos.categoria;
        return { ...p };
      }
    }
    throw new Error('Producto no encontrado');
  }

  async activar(id: string, tiendaId: string): Promise<void> {
    for (const p of this.productos.values()) {
      if (p.id === id && p.tiendaId === tiendaId) {
        p.activo = true;
        return;
      }
    }
    throw new Error('Producto no encontrado');
  }

  async desactivar(id: string, tiendaId: string): Promise<void> {
    for (const p of this.productos.values()) {
      if (p.id === id && p.tiendaId === tiendaId) {
        p.activo = false;
        return;
      }
    }
    throw new Error('Producto no encontrado');
  }

  async actualizarStock(id: string, tiendaId: string, cantidad: number): Promise<void> {
    for (const p of this.productos.values()) {
      if (p.id === id && p.tiendaId === tiendaId) {
        p.stock += cantidad;
        return;
      }
    }
    throw new Error('Producto no encontrado');
  }
}
