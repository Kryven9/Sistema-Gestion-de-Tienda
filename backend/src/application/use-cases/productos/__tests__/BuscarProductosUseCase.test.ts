import { describe, it, expect, beforeEach } from 'vitest';
import { BuscarProductosUseCase } from '../BuscarProductosUseCase';
import { FakeProductoRepository } from './FakeProductoRepository';

describe('BuscarProductosUseCase', () => {
  let casoUso: BuscarProductosUseCase;
  let repositorioProductos: FakeProductoRepository;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
    casoUso = new BuscarProductosUseCase(repositorioProductos);

    await repositorioProductos.guardar({
      id: 'prod-1',
      tiendaId: 'tienda-1',
      nombre: 'Café Americano',
      precio: 35,
      stock: 100,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'prod-2',
      tiendaId: 'tienda-1',
      nombre: 'Café Latte',
      precio: 45,
      stock: 50,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioProductos.guardar({
      id: 'prod-3',
      tiendaId: 'tienda-1',
      nombre: 'Agua Mineral',
      precio: 20,
      stock: 80,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });
  });

  it('debería buscar productos por nombre parcial', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', nombre: 'Caf' });
    expect(resultado).toHaveLength(2);
    expect(resultado.every((p) => p.nombre.includes('Caf'))).toBe(true);
  });

  it('debería devolver lista vacía si no hay coincidencias', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', nombre: 'XYZ' });
    expect(resultado).toHaveLength(0);
  });

  it('no debería devolver productos de otra tienda', async () => {
    await repositorioProductos.guardar({
      id: 'prod-4',
      tiendaId: 'tienda-2',
      nombre: 'Café Espresso',
      precio: 40,
      stock: 30,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });

    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', nombre: 'Caf' });
    expect(resultado).toHaveLength(2);
  });

  it('debería buscar por nombre completo', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', nombre: 'Agua Mineral' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe('Agua Mineral');
  });

  it('debería ser case-insensitive', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', nombre: 'café' });
    expect(resultado).toHaveLength(2);
  });
});
