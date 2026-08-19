import { describe, it, expect, beforeEach } from 'vitest';
import { AnularVentaUseCase } from '../AnularVentaUseCase';
import { FakeVentaRepository } from './FakeVentaRepository';
import { FakeProductoRepository } from '../../productos/__tests__/FakeProductoRepository';
import { FakeFacturaRepository } from './FakeFacturaRepository';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';

describe('AnularVentaUseCase', () => {
  let casoUso: AnularVentaUseCase;
  let repositorioVentas: FakeVentaRepository;
  let repositorioProductos: FakeProductoRepository;
  let repositorioFacturas: FakeFacturaRepository;

  beforeEach(async () => {
    repositorioVentas = new FakeVentaRepository();
    repositorioProductos = new FakeProductoRepository();
    repositorioFacturas = new FakeFacturaRepository();
    casoUso = new AnularVentaUseCase(repositorioVentas, repositorioProductos, repositorioFacturas);

    await repositorioProductos.guardar({
      id: 'prod-1',
      tiendaId: 'tienda-1',
      nombre: 'Café',
      precio: 35,
      stock: 7,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });

    await repositorioVentas.guardar(
      {
        id: 'venta-1',
        tiendaId: 'tienda-1',
        usuarioId: 'user-1',
        total: 70,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: new Date(),
      },
      [
        {
          id: 'det-1',
          tiendaId: 'tienda-1',
          ventaId: 'venta-1',
          productoId: 'prod-1',
          cantidad: 2,
          precioUnitario: 35,
          subtotal: 70,
        },
      ],
    );

    await repositorioFacturas.guardar({
      id: 'fact-1',
      tiendaId: 'tienda-1',
      ventaId: 'venta-1',
      folio: 'F-001',
      total: 70,
      estado: 'EMITIDA' as never,
      leyenda: 'Documento simulado',
      fechaEmision: new Date(),
    });
  });

  it('debería anular la venta y restaurar stock', async () => {
    await casoUso.ejecutar({ ventaId: 'venta-1', tiendaId: 'tienda-1' });

    const venta = await repositorioVentas.buscarPorId('venta-1', 'tienda-1');
    expect(venta?.anulada).toBe(true);

    const producto = await repositorioProductos.buscarPorId('prod-1', 'tienda-1');
    expect(producto?.stock).toBe(9);
  });

  it('debería anular la factura asociada', async () => {
    await casoUso.ejecutar({ ventaId: 'venta-1', tiendaId: 'tienda-1' });

    const factura = await repositorioFacturas.buscarPorVentaId('venta-1', 'tienda-1');
    expect(factura?.estado).toBe('ANULADA');
  });

  it('debería rechazar si la venta no existe', async () => {
    await expect(casoUso.ejecutar({ ventaId: 'no-existe', tiendaId: 'tienda-1' })).rejects.toThrow(
      EntidadNoEncontradaError,
    );
  });

  it('debería rechazar si la venta ya está anulada', async () => {
    await repositorioVentas.anular('venta-1', 'tienda-1');

    await expect(casoUso.ejecutar({ ventaId: 'venta-1', tiendaId: 'tienda-1' })).rejects.toThrow(
      'La venta ya está anulada',
    );
  });
});
