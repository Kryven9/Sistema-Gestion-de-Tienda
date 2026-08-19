import { describe, it, expect, beforeEach } from 'vitest';
import { ConsultarDetalleVentaUseCase } from '../ConsultarDetalleVentaUseCase';
import { FakeVentaRepository } from './FakeVentaRepository';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';

describe('ConsultarDetalleVentaUseCase', () => {
  let repositorioVentas: FakeVentaRepository;

  beforeEach(async () => {
    repositorioVentas = new FakeVentaRepository();
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
      [],
    );
  });

  it('debería devolver el detalle de una venta', async () => {
    const casoUso = new ConsultarDetalleVentaUseCase(repositorioVentas);
    const resultado = await casoUso.ejecutar({
      ventaId: 'venta-1',
      tiendaId: 'tienda-1',
      usuarioId: 'user-1',
      esDueno: true,
    });
    expect(resultado.id).toBe('venta-1');
  });

  it('debería rechazar si la venta no existe', async () => {
    const casoUso = new ConsultarDetalleVentaUseCase(repositorioVentas);
    await expect(
      casoUso.ejecutar({
        ventaId: 'no-existe',
        tiendaId: 'tienda-1',
        usuarioId: 'user-1',
        esDueno: true,
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });

  it('debería rechazar si el operador intenta ver venta de otro', async () => {
    const casoUso = new ConsultarDetalleVentaUseCase(repositorioVentas);
    await expect(
      casoUso.ejecutar({
        ventaId: 'venta-1',
        tiendaId: 'tienda-1',
        usuarioId: 'user-2',
        esDueno: false,
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });
});
