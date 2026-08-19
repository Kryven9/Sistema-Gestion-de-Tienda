import { Venta } from '../../../domain/entities/Venta';
import { DetalleVenta } from '../../../domain/entities/DetalleVenta';
import { OrigenVenta } from '../../../domain/enums/OrigenVenta';
import { ProductoRepository } from '../../../domain/ports/repositories/ProductoRepository';
import { VentaRepository } from '../../../domain/ports/repositories/VentaRepository';
import { IdGenerator } from '../../../domain/ports/services/IdGenerator';
import { StockInsuficienteError } from '../../../domain/errors/StockInsuficienteError';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';
import { GenerarFacturaSimuladaUseCase } from '../facturacion/GenerarFacturaSimuladaUseCase';

export interface ItemVenta {
  productoId: string;
  cantidad: number;
}

export interface RegistrarVentaComando {
  tiendaId: string;
  usuarioId: string;
  items: ItemVenta[];
  origen?: OrigenVenta;
}

export class RegistrarVentaUseCase {
  constructor(
    private readonly repositorioProductos: ProductoRepository,
    private readonly repositorioVentas: VentaRepository,
    private readonly generarFacturaSimuladaUseCase: GenerarFacturaSimuladaUseCase,
    private readonly generadorId: IdGenerator,
  ) {}

  async ejecutar(comando: RegistrarVentaComando): Promise<Venta & { detalles: DetalleVenta[] }> {
    if (comando.items.length === 0) {
      throw new Error('La venta debe tener al menos un producto');
    }

    const productosEncontrados: Array<{
      productoId: string;
      nombre: string;
      precio: number;
      cantidad: number;
      subtotal: number;
    }> = [];

    for (const item of comando.items) {
      const producto = await this.repositorioProductos.buscarPorId(
        item.productoId,
        comando.tiendaId,
      );

      if (!producto) {
        throw new EntidadNoEncontradaError('Producto', item.productoId);
      }

      if (producto.stock < item.cantidad) {
        throw new StockInsuficienteError(producto.nombre, producto.stock, item.cantidad);
      }

      const subtotal = producto.precio * item.cantidad;
      productosEncontrados.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: item.cantidad,
        subtotal,
      });
    }

    const total = productosEncontrados.reduce((suma, item) => suma + item.subtotal, 0);

    const ventaId = this.generadorId.generar();
    const now = new Date();

    const venta: Venta = {
      id: ventaId,
      tiendaId: comando.tiendaId,
      usuarioId: comando.usuarioId,
      total,
      origen: comando.origen ?? OrigenVenta.MANUAL,
      anulada: false,
      fecha: now,
    };

    const detalles: DetalleVenta[] = productosEncontrados.map((item) => ({
      id: this.generadorId.generar(),
      tiendaId: comando.tiendaId,
      ventaId,
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario: item.precio,
      subtotal: item.subtotal,
    }));

    await this.repositorioVentas.guardar(venta, detalles);

    for (const item of productosEncontrados) {
      await this.repositorioProductos.actualizarStock(
        item.productoId,
        comando.tiendaId,
        -item.cantidad,
      );
    }

    await this.generarFacturaSimuladaUseCase.ejecutar({
      tiendaId: comando.tiendaId,
      ventaId,
      total,
      fechaEmision: now,
    });

    return { ...venta, detalles };
  }
}
