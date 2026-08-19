import { describe, it, expect, beforeEach } from 'vitest';
import { FiltrarPorCategoriaUseCase } from '../FiltrarPorCategoriaUseCase';
import { FakeProductoRepository } from './FakeProductoRepository';

describe('FiltrarPorCategoriaUseCase', () => {
  let casoUso: FiltrarPorCategoriaUseCase;
  let repositorioProductos: FakeProductoRepository;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
    casoUso = new FiltrarPorCategoriaUseCase(repositorioProductos);

    await repositorioProductos.guardar({
      id: 'prod-1',
      tiendaId: 'tienda-1',
      nombre: 'Café',
      precio: 35,
      stock: 100,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'prod-2',
      tiendaId: 'tienda-1',
      nombre: 'Agua',
      precio: 20,
      stock: 50,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'prod-3',
      tiendaId: 'tienda-1',
      nombre: 'Croissant',
      precio: 45,
      stock: 30,
      categoria: 'Panadería',
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'prod-4',
      tiendaId: 'tienda-1',
      nombre: 'Sandwich',
      precio: 65,
      stock: 20,
      categoria: 'Comida',
      activo: true,
      fechaCreacion: new Date(),
    });
  });

  it('debería filtrar productos por categoría', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', categoria: 'Bebidas' });
    expect(resultado).toHaveLength(2);
    expect(resultado.every((p) => p.categoria === 'Bebidas')).toBe(true);
  });

  it('debería devolver lista vacía si no hay productos en la categoría', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', categoria: 'Lácteos' });
    expect(resultado).toHaveLength(0);
  });

  it('no debería devolver productos de otra tienda', async () => {
    await repositorioProductos.guardar({
      id: 'prod-5',
      tiendaId: 'tienda-2',
      nombre: 'Leche',
      precio: 25,
      stock: 40,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });

    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', categoria: 'Bebidas' });
    expect(resultado).toHaveLength(2);
  });

  it('debería devolver un solo producto si solo hay uno en la categoría', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', categoria: 'Comida' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe('Sandwich');
  });
});
