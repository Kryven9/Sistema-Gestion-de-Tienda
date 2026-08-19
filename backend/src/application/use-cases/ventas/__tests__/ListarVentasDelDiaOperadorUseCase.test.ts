import { describe, it, expect, beforeEach } from 'vitest';
import { ListarVentasDelDiaOperadorUseCase } from '../ListarVentasDelDiaOperadorUseCase';
import { FakeVentaRepository } from './FakeVentaRepository';

describe('ListarVentasDelDiaOperadorUseCase', () => {
  let repositorioVentas: FakeVentaRepository;

  beforeEach(() => {
    repositorioVentas = new FakeVentaRepository();
  });

  it('debería listar las ventas del día del operador', async () => {
    const casoUso = new ListarVentasDelDiaOperadorUseCase(repositorioVentas);

    await repositorioVentas.guardar(
      {
        id: 'v1',
        tiendaId: 't1',
        usuarioId: 'u1',
        total: 100,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: new Date(),
      },
      [],
    );

    const resultado = await casoUso.ejecutar({ usuarioId: 'u1', tiendaId: 't1' });
    expect(resultado).toHaveLength(1);
  });

  it('no debería devolver ventas de otro operador', async () => {
    const casoUso = new ListarVentasDelDiaOperadorUseCase(repositorioVentas);

    await repositorioVentas.guardar(
      {
        id: 'v1',
        tiendaId: 't1',
        usuarioId: 'u1',
        total: 100,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: new Date(),
      },
      [],
    );

    const resultado = await casoUso.ejecutar({ usuarioId: 'u2', tiendaId: 't1' });
    expect(resultado).toHaveLength(0);
  });

  it('debería excluir ventas de días anteriores', async () => {
    const casoUso = new ListarVentasDelDiaOperadorUseCase(repositorioVentas);

    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    ayer.setHours(12, 0, 0, 0);

    await repositorioVentas.guardar(
      {
        id: 'ayer-u1',
        tiendaId: 't1',
        usuarioId: 'u1',
        total: 50,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: ayer,
      },
      [],
    );

    const resultado = await casoUso.ejecutar({ usuarioId: 'u1', tiendaId: 't1' });
    expect(resultado).toHaveLength(0);
  });
});
