import { describe, it, expect, beforeEach } from 'vitest';
import { ListarProductosUseCase } from '../ListarProductosUseCase';
import { BuscarProductosUseCase } from '../BuscarProductosUseCase';
import { FiltrarPorCategoriaUseCase } from '../FiltrarPorCategoriaUseCase';
import { ConsultarStockUseCase } from '../ConsultarStockUseCase';
import { FakeProductoRepository } from './FakeProductoRepository';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';

describe('ListarProductosUseCase', () => {
  let repositorioProductos: FakeProductoRepository;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
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
  });

  it('debería listar todos los productos activos de la tienda', async () => {
    const casoUso = new ListarProductosUseCase(repositorioProductos);
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1' });
    expect(resultado).toHaveLength(3);
  });

  it('debería buscar productos por nombre parcial', async () => {
    const casoUso = new BuscarProductosUseCase(repositorioProductos);
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', nombre: 'Caf' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe('Café');
  });

  it('debería filtrar por categoría', async () => {
    const casoUso = new FiltrarPorCategoriaUseCase(repositorioProductos);
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1', categoria: 'Bebidas' });
    expect(resultado).toHaveLength(2);
  });

  it('debería consultar stock de un producto', async () => {
    const casoUso = new ConsultarStockUseCase(repositorioProductos);
    const resultado = await casoUso.ejecutar({ productoId: 'prod-1', tiendaId: 'tienda-1' });
    expect(resultado.stock).toBe(100);
    expect(resultado.nombre).toBe('Café');
  });

  it('debería rechazar consultar stock de producto inexistente', async () => {
    const casoUso = new ConsultarStockUseCase(repositorioProductos);
    await expect(
      casoUso.ejecutar({ productoId: 'no-existe', tiendaId: 'tienda-1' }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });
});
