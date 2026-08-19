import { PrismaClient } from '@prisma/client';
import { Producto } from '../../../domain/entities/Producto';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';

export class PrismaProductoRepository implements ProductoRepository {
  constructor(private prisma: PrismaClient) {}

  private aEntidad(row: {
    id: string;
    tiendaId: string;
    nombre: string;
    precio: import('@prisma/client').Prisma.Decimal;
    stock: number;
    categoria: string | null;
    activo: boolean;
    fechaCreacion: Date;
  }): Producto {
    return {
      id: row.id,
      tiendaId: row.tiendaId,
      nombre: row.nombre,
      precio: Number(row.precio),
      stock: row.stock,
      categoria: row.categoria,
      activo: row.activo,
      fechaCreacion: row.fechaCreacion,
    };
  }

  async guardar(producto: Producto): Promise<Producto> {
    const guardado = await this.prisma.producto.create({
      data: {
        id: producto.id,
        tiendaId: producto.tiendaId,
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        activo: producto.activo,
        fechaCreacion: producto.fechaCreacion,
      },
    });

    return this.aEntidad(guardado);
  }

  async buscarPorId(id: string, tiendaId: string): Promise<Producto | null> {
    const producto = await this.prisma.producto.findFirst({
      where: { id, tiendaId },
    });
    if (!producto) return null;
    return this.aEntidad(producto);
  }

  async buscarPorNombre(tiendaId: string, nombre: string): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: {
        tiendaId,
        nombre: { contains: nombre },
        activo: true,
      },
      orderBy: { nombre: 'asc' },
    });
    return productos.map((p) => this.aEntidad(p));
  }

  async listarPorTienda(tiendaId: string): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: { tiendaId },
      orderBy: { nombre: 'asc' },
    });
    return productos.map((p) => this.aEntidad(p));
  }

  async listarPorCategoria(tiendaId: string, categoria: string): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: { tiendaId, categoria, activo: true },
      orderBy: { nombre: 'asc' },
    });
    return productos.map((p) => this.aEntidad(p));
  }

  async actualizar(
    id: string,
    tiendaId: string,
    datos: Partial<Pick<Producto, 'nombre' | 'precio' | 'categoria'>>,
  ): Promise<Producto> {
    const actualizado = await this.prisma.producto.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: datos,
    });
    return this.aEntidad(actualizado);
  }

  async activar(id: string, tiendaId: string): Promise<void> {
    await this.prisma.producto.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: { activo: true },
    });
  }

  async desactivar(id: string, tiendaId: string): Promise<void> {
    await this.prisma.producto.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: { activo: false },
    });
  }

  async actualizarStock(id: string, tiendaId: string, cantidad: number): Promise<void> {
    await this.prisma.producto.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: { stock: { increment: cantidad } },
    });
  }
}
