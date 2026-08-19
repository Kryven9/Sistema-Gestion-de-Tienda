import { describe, it, expect, beforeEach } from 'vitest';
import { ConsultarStockUseCase } from '../ConsultarStockUseCase';
import { FakeProductoRepository } from './FakeProductoRepository';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';

describe('ConsultarStockUseCase', () => {
  let casoUso: ConsultarStockUseCase;
  let repositorioProductos: FakeProductoRepository;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
    casoUso = new ConsultarStockUseCase(repositorioProductos);

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
  });

  it('debería devolver el stock del producto', async () => {
    const resultado = await casoUso.ejecutar({ productoId: 'prod-1', tiendaId: 'tienda-1' });
    expect(resultado.productoId).toBe('prod-1');
    expect(resultado.nombre).toBe('Café Americano');
    expect(resultado.stock).toBe(100);
  });

  it('debería rechazar si el producto no existe', async () => {
    await expect(
      casoUso.ejecutar({ productoId: 'no-existe', tiendaId: 'tienda-1' }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });

  it('debería rechazar si el producto pertenece a otra tienda', async () => {
    await expect(casoUso.ejecutar({ productoId: 'prod-1', tiendaId: 'tienda-2' })).rejects.toThrow(
      EntidadNoEncontradaError,
    );
  });

  it('debería devolver stock en cero', async () => {
    await repositorioProductos.guardar({
      id: 'prod-2',
      tiendaId: 'tienda-1',
      nombre: 'Agua',
      precio: 20,
      stock: 0,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });

    const resultado = await casoUso.ejecutar({ productoId: 'prod-2', tiendaId: 'tienda-1' });
    expect(resultado.stock).toBe(0);
  });
});
