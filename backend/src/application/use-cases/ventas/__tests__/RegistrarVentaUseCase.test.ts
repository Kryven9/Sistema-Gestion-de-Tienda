import { describe, it, expect, beforeEach } from 'vitest';
import { RegistrarVentaUseCase } from '../RegistrarVentaUseCase';
import { FakeProductoRepository } from '../../productos/__tests__/FakeProductoRepository';
import { FakeVentaRepository } from './FakeVentaRepository';
import { FakeFacturaRepository } from './FakeFacturaRepository';
import { FakeIdGenerator } from '../../auth/__tests__/FakeIdGenerator';
import { StockInsuficienteError } from '../../../../domain/errors/StockInsuficienteError';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';

describe('RegistrarVentaUseCase', () => {
  let casoUso: RegistrarVentaUseCase;
  let repositorioProductos: FakeProductoRepository;
  let repositorioVentas: FakeVentaRepository;
  let repositorioFacturas: FakeFacturaRepository;
  let generadorId: FakeIdGenerator;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
    repositorioVentas = new FakeVentaRepository();
    repositorioFacturas = new FakeFacturaRepository();
    generadorId = new FakeIdGenerator();
    casoUso = new RegistrarVentaUseCase(
      repositorioProductos,
      repositorioVentas,
      repositorioFacturas,
      generadorId,
    );

    await repositorioProductos.guardar({
      id: 'prod-1',
      tiendaId: 'tienda-1',
      nombre: 'Café',
      precio: 35,
      stock: 10,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'prod-2',
      tiendaId: 'tienda-1',
      nombre: 'Agua',
      precio: 20,
      stock: 5,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });
  });

  it('debería registrar una venta con un producto', async () => {
    const resultado = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      usuarioId: 'user-1',
      items: [{ productoId: 'prod-1', cantidad: 2 }],
    });

    expect(resultado.total).toBe(70);
    expect(resultado.detalles).toHaveLength(1);
    expect(resultado.detalles[0].subtotal).toBe(70);
    expect(resultado.anulada).toBe(false);
  });

  it('debería registrar una venta con múltiples productos', async () => {
    const resultado = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      usuarioId: 'user-1',
      items: [
        { productoId: 'prod-1', cantidad: 2 },
        { productoId: 'prod-2', cantidad: 1 },
      ],
    });

    expect(resultado.total).toBe(90);
    expect(resultado.detalles).toHaveLength(2);
  });

  it('debería descontar stock después de la venta', async () => {
    await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      usuarioId: 'user-1',
      items: [{ productoId: 'prod-1', cantidad: 3 }],
    });

    const producto = await repositorioProductos.buscarPorId('prod-1', 'tienda-1');
    expect(producto?.stock).toBe(7);
  });

  it('debería generar factura automáticamente', async () => {
    const venta = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      usuarioId: 'user-1',
      items: [{ productoId: 'prod-1', cantidad: 1 }],
    });

    const factura = await repositorioFacturas.buscarPorVentaId(venta.id, 'tienda-1');
    expect(factura).not.toBeNull();
    expect(factura?.total).toBe(35);
    expect(factura?.leyenda).toBe('Documento simulado, sin validez fiscal');
  });

  it('debería rechazar stock insuficiente', async () => {
    await expect(
      casoUso.ejecutar({
        tiendaId: 'tienda-1',
        usuarioId: 'user-1',
        items: [{ productoId: 'prod-1', cantidad: 20 }],
      }),
    ).rejects.toThrow(StockInsuficienteError);
  });

  it('debería rechazar producto inexistente', async () => {
    await expect(
      casoUso.ejecutar({
        tiendaId: 'tienda-1',
        usuarioId: 'user-1',
        items: [{ productoId: 'no-existe', cantidad: 1 }],
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });

  it('debería rechazar venta sin items', async () => {
    await expect(
      casoUso.ejecutar({
        tiendaId: 'tienda-1',
        usuarioId: 'user-1',
        items: [],
      }),
    ).rejects.toThrow('La venta debe tener al menos un producto');
  });

  it('no debería descontar stock si falla la validación', async () => {
    await expect(
      casoUso.ejecutar({
        tiendaId: 'tienda-1',
        usuarioId: 'user-1',
        items: [
          { productoId: 'prod-1', cantidad: 1 },
          { productoId: 'prod-2', cantidad: 100 },
        ],
      }),
    ).rejects.toThrow(StockInsuficienteError);

    const prod1 = await repositorioProductos.buscarPorId('prod-1', 'tienda-1');
    expect(prod1?.stock).toBe(10);
  });
});
