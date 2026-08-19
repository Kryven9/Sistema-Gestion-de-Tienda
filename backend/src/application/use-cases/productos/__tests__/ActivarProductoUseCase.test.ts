import { describe, it, expect, beforeEach } from 'vitest';
import { ActivarProductoUseCase } from '../ActivarProductoUseCase';
import { FakeProductoRepository } from './FakeProductoRepository';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';

describe('ActivarProductoUseCase', () => {
  let casoUso: ActivarProductoUseCase;
  let repositorioProductos: FakeProductoRepository;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
    casoUso = new ActivarProductoUseCase(repositorioProductos);

    await repositorioProductos.guardar({
      id: 'prod-1',
      tiendaId: 'tienda-1',
      nombre: 'Café Americano',
      precio: 35,
      stock: 100,
      categoria: 'Bebidas',
      activo: false,
      fechaCreacion: new Date(),
    });
  });

  it('debería activar el producto', async () => {
    await expect(
      casoUso.ejecutar({ productoId: 'prod-1', tiendaId: 'tienda-1' }),
    ).resolves.toBeUndefined();

    const producto = await repositorioProductos.buscarPorId('prod-1', 'tienda-1');
    expect(producto?.activo).toBe(true);
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
});
