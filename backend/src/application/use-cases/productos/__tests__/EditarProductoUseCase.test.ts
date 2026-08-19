import { describe, it, expect, beforeEach } from 'vitest';
import { EditarProductoUseCase } from '../EditarProductoUseCase';
import { FakeProductoRepository } from './FakeProductoRepository';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';
import { ValorInvalidoError } from '../../../../domain/errors/ValorInvalidoError';

describe('EditarProductoUseCase', () => {
  let casoUso: EditarProductoUseCase;
  let repositorioProductos: FakeProductoRepository;

  beforeEach(async () => {
    repositorioProductos = new FakeProductoRepository();
    casoUso = new EditarProductoUseCase(repositorioProductos);

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

  it('debería editar el nombre del producto', async () => {
    const resultado = await casoUso.ejecutar({
      productoId: 'prod-1',
      tiendaId: 'tienda-1',
      nombre: 'Café Latte',
    });

    expect(resultado.nombre).toBe('Café Latte');
    expect(resultado.precio).toBe(35);
  });

  it('debería editar el precio del producto', async () => {
    const resultado = await casoUso.ejecutar({
      productoId: 'prod-1',
      tiendaId: 'tienda-1',
      precio: 45,
    });

    expect(resultado.precio).toBe(45);
  });

  it('debería rechazar precio negativo', async () => {
    await expect(
      casoUso.ejecutar({
        productoId: 'prod-1',
        tiendaId: 'tienda-1',
        precio: -10,
      }),
    ).rejects.toThrow(ValorInvalidoError);
  });

  it('debería rechazar si el producto no existe', async () => {
    await expect(
      casoUso.ejecutar({
        productoId: 'no-existe',
        tiendaId: 'tienda-1',
        nombre: 'Nuevo',
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });
});
