import { describe, it, expect, beforeEach } from 'vitest';
import { ListarFacturasPorFechaUseCase } from '../ListarFacturasPorFechaUseCase';
import { FakeFacturaRepository } from '../../ventas/__tests__/FakeFacturaRepository';
import { EstadoFactura } from '../../../../domain/enums/EstadoFactura';

describe('ListarFacturasPorFechaUseCase', () => {
  let repositorioFacturas: FakeFacturaRepository;

  beforeEach(() => {
    repositorioFacturas = new FakeFacturaRepository();
  });

  it('debería listar facturas dentro del rango de fechas', async () => {
    const casoUso = new ListarFacturasPorFechaUseCase(repositorioFacturas);
    const ahora = new Date();

    await repositorioFacturas.guardar({
      id: 'f1',
      tiendaId: 't1',
      ventaId: 'v1',
      folio: 'F-001',
      total: 100,
      estado: EstadoFactura.EMITIDA,
      leyenda: 'Documento simulado, sin validez fiscal',
      fechaEmision: ahora,
    });

    const resultado = await casoUso.ejecutar({
      tiendaId: 't1',
      desde: new Date(ahora.getTime() - 60000),
      hasta: new Date(ahora.getTime() + 60000),
    });
    expect(resultado).toHaveLength(1);
  });

  it('debería excluir facturas fuera del rango', async () => {
    const casoUso = new ListarFacturasPorFechaUseCase(repositorioFacturas);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    await repositorioFacturas.guardar({
      id: 'ayer',
      tiendaId: 't1',
      ventaId: 'ayer',
      folio: 'F-AYER',
      total: 50,
      estado: EstadoFactura.EMITIDA,
      leyenda: 'Documento simulado, sin validez fiscal',
      fechaEmision: ayer,
    });

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
    const casoUso = new ListarFacturasPorFechaUseCase(repositorioFacturas);
    const ahora = new Date();

    await repositorioFacturas.guardar({
      id: 't1-f',
      tiendaId: 't1',
      ventaId: 'v1',
      folio: 'F-T1',
      total: 100,
      estado: EstadoFactura.EMITIDA,
      leyenda: 'Documento simulado, sin validez fiscal',
      fechaEmision: ahora,
    });
    await repositorioFacturas.guardar({
      id: 't2-f',
      tiendaId: 't2',
      ventaId: 'v1',
      folio: 'F-T2',
      total: 200,
      estado: EstadoFactura.EMITIDA,
      leyenda: 'Documento simulado, sin validez fiscal',
      fechaEmision: ahora,
    });

    const resultado = await casoUso.ejecutar({
      tiendaId: 't1',
      desde: new Date(ahora.getTime() - 60000),
      hasta: new Date(ahora.getTime() + 60000),
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].tiendaId).toBe('t1');
  });
});
