import { describe, it, expect, beforeEach } from 'vitest';
import { CrearProductoUseCase } from '../CrearProductoUseCase';
import { FakeProductoRepository } from './FakeProductoRepository';
import { FakeIdGenerator } from '../../auth/__tests__/FakeIdGenerator';
import { ValorInvalidoError } from '../../../../domain/errors/ValorInvalidoError';

describe('CrearProductoUseCase', () => {
  let casoUso: CrearProductoUseCase;
  let repositorioProductos: FakeProductoRepository;
  let generadorId: FakeIdGenerator;

  beforeEach(() => {
    repositorioProductos = new FakeProductoRepository();
    generadorId = new FakeIdGenerator();
    casoUso = new CrearProductoUseCase(repositorioProductos, generadorId);
  });

  it('debería crear un producto exitosamente', async () => {
    const resultado = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      nombre: 'Café Americano',
      precio: 35,
      stock: 100,
      categoria: 'Bebidas',
    });

    expect(resultado.nombre).toBe('Café Americano');
    expect(resultado.precio).toBe(35);
    expect(resultado.stock).toBe(100);
    expect(resultado.categoria).toBe('Bebidas');
    expect(resultado.activo).toBe(true);
  });

  it('debería crear producto sin categoría', async () => {
    const resultado = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      nombre: 'Agua',
      precio: 20,
      stock: 50,
    });

    expect(resultado.categoria).toBeNull();
  });

  it('debería rechazar precio negativo', async () => {
    await expect(
      casoUso.ejecutar({
        tiendaId: 'tienda-1',
        nombre: 'Producto',
        precio: -10,
        stock: 0,
      }),
    ).rejects.toThrow(ValorInvalidoError);
  });

  it('debería rechazar stock negativo', async () => {
    await expect(
      casoUso.ejecutar({
        tiendaId: 'tienda-1',
        nombre: 'Producto',
        precio: 10,
        stock: -5,
      }),
    ).rejects.toThrow(ValorInvalidoError);
  });

  it('debería permitir precio y stock en cero', async () => {
    const resultado = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      nombre: 'Producto Gratis',
      precio: 0,
      stock: 0,
    });

    expect(resultado.precio).toBe(0);
    expect(resultado.stock).toBe(0);
  });
});
