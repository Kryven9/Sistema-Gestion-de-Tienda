import { describe, it, expect, beforeEach } from 'vitest';
import { ListarVentasPorFechaUseCase } from '../ListarVentasPorFechaUseCase';
import { FakeVentaRepository } from './FakeVentaRepository';

describe('ListarVentasPorFechaUseCase', () => {
  let repositorioVentas: FakeVentaRepository;

  beforeEach(() => {
    repositorioVentas = new FakeVentaRepository();
  });

  it('debería listar ventas dentro del rango de fechas', async () => {
    const casoUso = new ListarVentasPorFechaUseCase(repositorioVentas);
    const ahora = new Date();

    await repositorioVentas.guardar(
      {
        id: 'v1',
        tiendaId: 't1',
        usuarioId: 'u1',
        total: 100,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: ahora,
      },
      [],
    );

    const resultado = await casoUso.ejecutar({
      tiendaId: 't1',
      desde: new Date(ahora.getTime() - 60000),
      hasta: new Date(ahora.getTime() + 60000),
    });
    expect(resultado).toHaveLength(1);
  });

  it('debería excluir ventas fuera del rango de fechas', async () => {
    const casoUso = new ListarVentasPorFechaUseCase(repositorioVentas);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    await repositorioVentas.guardar(
      {
        id: 'ayer',
        tiendaId: 't1',
        usuarioId: 'u1',
        total: 50,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: ayer,
      },
      [],
    );

    const inicioHoy = new Date(hoy);
    inicioHoy.setHours(0, 0, 0, 0);
    const finHoy = new Date(hoy);
    finHoy.setHours(23, 59, 59, 999);

    const resultado = await casoUso.ejecutar({
      tiendaId: 't1',
      desde: inicioHoy,
      hasta: finHoy,
    });
    expect(resultado).toHaveLength(0);
  });

  it('debería filtrar por tienda', async () => {
    const casoUso = new ListarVentasPorFechaUseCase(repositorioVentas);
    const ahora = new Date();

    await repositorioVentas.guardar(
      {
        id: 't1-v1',
        tiendaId: 't1',
        usuarioId: 'u1',
        total: 100,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: ahora,
      },
      [],
    );
    await repositorioVentas.guardar(
      {
        id: 't2-v1',
        tiendaId: 't2',
        usuarioId: 'u1',
        total: 200,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: ahora,
      },
      [],
    );

    const resultado = await casoUso.ejecutar({
      tiendaId: 't1',
      desde: new Date(ahora.getTime() - 60000),
      hasta: new Date(ahora.getTime() + 60000),
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].tiendaId).toBe('t1');
  });
});
