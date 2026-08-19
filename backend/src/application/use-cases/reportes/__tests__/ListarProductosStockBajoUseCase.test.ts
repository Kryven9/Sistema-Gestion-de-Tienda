import { describe, it, expect, beforeEach } from 'vitest';
import { ListarProductosStockBajoUseCase } from '../ListarProductosStockBajoUseCase';
import { FakeProductoRepository } from '../../productos/__tests__/FakeProductoRepository';
import { UMBRAL_STOCK_BAJO_POR_DEFECTO } from '../../../../domain/constants/ReporteConstants';

describe('ListarProductosStockBajoUseCase', () => {
  let casoUso: ListarProductosStockBajoUseCase;
  let repositorioProductos: FakeProductoRepository;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
    casoUso = new ListarProductosStockBajoUseCase(repositorioProductos);

    await repositorioProductos.guardar({
      id: 'critico',
      tiendaId: 'tienda-1',
      nombre: 'Stock 0',
      precio: 10,
      stock: 0,
      categoria: null,
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'bajo',
      tiendaId: 'tienda-1',
      nombre: 'Stock 3',
      precio: 10,
      stock: 3,
      categoria: null,
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'saludable',
      tiendaId: 'tienda-1',
      nombre: 'Stock 20',
      precio: 10,
      stock: 20,
      categoria: null,
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'inactivo',
      tiendaId: 'tienda-1',
      nombre: 'Inactivo',
      precio: 10,
      stock: 1,
      categoria: null,
      activo: false,
      fechaCreacion: new Date(),
    });
  });

  it('debería devolver productos activos con stock menor al umbral por defecto', async () => {
    const productos = await casoUso.ejecutar({ tiendaId: 'tienda-1' });
    expect(productos.map((p) => p.id).sort()).toEqual(['bajo', 'critico']);
    expect(UMBRAL_STOCK_BAJO_POR_DEFECTO).toBeGreaterThan(0);
  });

  it('debería respetar un umbral personalizado', async () => {
    const productos = await casoUso.ejecutar({ tiendaId: 'tienda-1', umbral: 2 });
    expect(productos.map((p) => p.id)).toContain('critico');
    expect(productos.map((p) => p.id)).not.toContain('bajo');
  });

  it('debería ignorar productos inactivos', async () => {
    const productos = await casoUso.ejecutar({ tiendaId: 'tienda-1', umbral: 5 });
    expect(productos.find((p) => p.id === 'inactivo')).toBeUndefined();
  });

  it('debería devolver solo los productos activos con stock menor al umbral', async () => {
    const productos = await casoUso.ejecutar({ tiendaId: 'tienda-1', umbral: 25 });
    const ids = productos.map((p) => p.id).sort();
    expect(ids).toEqual(['bajo', 'critico', 'saludable']);
  });

  it('debería excluir productos inactivos incluso si su stock es bajo', async () => {
    await repositorioProductos.guardar({
      id: 'saludable-2',
      tiendaId: 'tienda-1',
      nombre: 'Stock 50',
      precio: 10,
      stock: 50,
      categoria: null,
      activo: true,
      fechaCreacion: new Date(),
    });
    const productos = await casoUso.ejecutar({ tiendaId: 'tienda-1', umbral: 5 });
    expect(productos.some((p) => p.id === 'inactivo')).toBe(false);
  });
});
