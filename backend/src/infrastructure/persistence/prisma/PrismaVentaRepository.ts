import { PrismaClient } from '@prisma/client';
import { Venta } from '../../../domain/entities/Venta';
import { DetalleVenta } from '../../../domain/entities/DetalleVenta';
import { ProductoVendido } from '../../../domain/entities/Reporte';
import { LineaVendida, VentaRepository } from '../../../domain/ports/repositories/VentaRepository';
import { OrigenVenta } from '../../../domain/enums/OrigenVenta';

export class PrismaVentaRepository implements VentaRepository {
  constructor(private prisma: PrismaClient) {}

  async guardar(venta: Venta, detalles: DetalleVenta[]): Promise<Venta> {
    const guardada = await this.prisma.venta.create({
      data: {
        id: venta.id,
        tiendaId: venta.tiendaId,
        usuarioId: venta.usuarioId,
        total: venta.total,
        origen: venta.origen,
        anulada: venta.anulada,
        fecha: venta.fecha,
        detallesVenta: {
          create: detalles.map((d) => ({
            id: d.id,
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.subtotal,
          })),
        },
      },
    });

    return {
      id: guardada.id,
      tiendaId: guardada.tiendaId,
      usuarioId: guardada.usuarioId,
      total: Number(guardada.total),
      origen: guardada.origen as OrigenVenta,
      anulada: guardada.anulada,
      fecha: guardada.fecha,
    };
  }

  async buscarPorId(
    id: string,
    tiendaId: string,
  ): Promise<(Venta & { detalles: DetalleVenta[] }) | null> {
    const venta = await this.prisma.venta.findFirst({
      where: { id, tiendaId },
      include: { detallesVenta: true },
    });

    if (!venta) return null;

    return {
      id: venta.id,
      tiendaId: venta.tiendaId,
      usuarioId: venta.usuarioId,
      total: Number(venta.total),
      origen: venta.origen as OrigenVenta,
      anulada: venta.anulada,
      fecha: venta.fecha,
      detalles: venta.detallesVenta.map((d) => ({
        id: d.id,
        tiendaId: d.tiendaId,
        ventaId: d.ventaId,
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precioUnitario),
        subtotal: Number(d.subtotal),
      })),
    };
  }

  async listarPorRangoFechas(tiendaId: string, desde: Date, hasta: Date): Promise<Venta[]> {
    const ventas = await this.prisma.venta.findMany({
      where: {
        tiendaId,
        fecha: { gte: desde, lte: hasta },
      },
      orderBy: { fecha: 'desc' },
    });

    return ventas.map((v) => ({
      id: v.id,
      tiendaId: v.tiendaId,
      usuarioId: v.usuarioId,
      total: Number(v.total),
      origen: v.origen as OrigenVenta,
      anulada: v.anulada,
      fecha: v.fecha,
    }));
  }

  async listarPorUsuarioYFecha(usuarioId: string, tiendaId: string, fecha: Date): Promise<Venta[]> {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const ventas = await this.prisma.venta.findMany({
      where: {
        usuarioId,
        tiendaId,
        fecha: { gte: inicioDia, lte: finDia },
      },
      orderBy: { fecha: 'desc' },
    });

    return ventas.map((v) => ({
      id: v.id,
      tiendaId: v.tiendaId,
      usuarioId: v.usuarioId,
      total: Number(v.total),
      origen: v.origen as OrigenVenta,
      anulada: v.anulada,
      fecha: v.fecha,
    }));
  }

  async anular(id: string, tiendaId: string): Promise<void> {
    await this.prisma.venta.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: { anulada: true },
    });
  }

  async listarLineasVendidasPorRango(
    tiendaId: string,
    desde: Date,
    hasta: Date,
  ): Promise<LineaVendida[]> {
    const lineas = await this.prisma.detalleVenta.findMany({
      where: {
        tiendaId,
        venta: { anulada: false, fecha: { gte: desde, lte: hasta } },
      },
      include: { venta: true },
    });

    return lineas.map((detalle) => ({
      productoId: detalle.productoId,
      nombre: '',
      cantidad: detalle.cantidad,
      subtotal: Number(detalle.subtotal),
    }));
  }

  async contarProductosMasVendidos(
    tiendaId: string,
    desde: Date,
    hasta: Date,
    limite: number,
  ): Promise<ProductoVendido[]> {
    const agrupado = await this.prisma.detalleVenta.groupBy({
      by: ['productoId'],
      where: {
        tiendaId,
        venta: { anulada: false, fecha: { gte: desde, lte: hasta } },
      },
      _sum: { cantidad: true, subtotal: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: Math.max(1, limite),
    });

    if (agrupado.length === 0) return [];

    const productos = await this.prisma.producto.findMany({
      where: {
        tiendaId,
        id: { in: agrupado.map((item) => item.productoId) },
      },
    });
    const nombres = new Map(productos.map((producto) => [producto.id, producto.nombre]));

    return agrupado.map((item) => ({
      productoId: item.productoId,
      nombre: nombres.get(item.productoId) ?? `Producto ${item.productoId.slice(0, 6)}`,
      cantidadVendida: item._sum.cantidad ?? 0,
      totalGenerado: Number(item._sum.subtotal ?? 0),
    }));
  }
}
