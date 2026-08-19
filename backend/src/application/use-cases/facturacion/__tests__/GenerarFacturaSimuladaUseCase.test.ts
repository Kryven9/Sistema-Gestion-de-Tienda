import { describe, it, expect, beforeEach } from 'vitest';
import { GenerarFacturaSimuladaUseCase } from '../GenerarFacturaSimuladaUseCase';
import { GeneradorFolio } from '../../../../domain/services/GeneradorFolio';
import { FakeFacturaRepository } from '../../ventas/__tests__/FakeFacturaRepository';
import { FakeIdGenerator } from '../../auth/__tests__/FakeIdGenerator';
import { EstadoFactura } from '../../../../domain/enums/EstadoFactura';

describe('GenerarFacturaSimuladaUseCase', () => {
  let casoUso: GenerarFacturaSimuladaUseCase;
  let repositorioFacturas: FakeFacturaRepository;
  let generadorId: FakeIdGenerator;

  beforeEach(() => {
    repositorioFacturas = new FakeFacturaRepository();
    generadorId = new FakeIdGenerator();
    const generadorFolio = new GeneradorFolio(generadorId);
    casoUso = new GenerarFacturaSimuladaUseCase(repositorioFacturas, generadorFolio, generadorId);
  });

  it('debería generar una factura emitida y persistirla', async () => {
    const factura = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      ventaId: 'venta-1',
      total: 150,
    });

    expect(factura.id).toMatch(/^id-\d+$/);
    expect(factura.tiendaId).toBe('tienda-1');
    expect(factura.ventaId).toBe('venta-1');
    expect(factura.total).toBe(150);
    expect(factura.estado).toBe(EstadoFactura.EMITIDA);
    expect(factura.leyenda).toBe('Documento simulado, sin validez fiscal');
    expect(factura.folio).toMatch(/^F-\d{8}-[A-Z0-9]{1,8}$/);

    const guardada = await repositorioFacturas.buscarPorVentaId('venta-1', 'tienda-1');
    expect(guardada?.folio).toBe(factura.folio);
  });

  it('debería generar folios únicos por venta', async () => {
    const primera = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      ventaId: 'venta-a',
      total: 50,
    });
    const segunda = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      ventaId: 'venta-b',
      total: 75,
    });

    expect(primera.folio).not.toBe(segunda.folio);
    expect(primera.id).not.toBe(segunda.id);
  });
});
