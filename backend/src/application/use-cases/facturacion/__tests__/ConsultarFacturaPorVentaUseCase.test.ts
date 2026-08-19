import { describe, it, expect, beforeEach } from 'vitest';
import { ConsultarFacturaPorVentaUseCase } from '../ConsultarFacturaPorVentaUseCase';
import { FakeFacturaRepository } from '../../ventas/__tests__/FakeFacturaRepository';
import { EstadoFactura } from '../../../../domain/enums/EstadoFactura';

describe('ConsultarFacturaPorVentaUseCase', () => {
  let repositorioFacturas: FakeFacturaRepository;

  beforeEach(async () => {
    repositorioFacturas = new FakeFacturaRepository();
    await repositorioFacturas.guardar({
      id: 'fact-1',
      tiendaId: 'tienda-1',
      ventaId: 'venta-1',
      folio: 'F-001',
      total: 80,
      estado: EstadoFactura.EMITIDA,
      leyenda: 'Documento simulado, sin validez fiscal',
      fechaEmision: new Date(),
    });
  });

  it('debería devolver la factura asociada a la venta', async () => {
    const casoUso = new ConsultarFacturaPorVentaUseCase(repositorioFacturas);
    const resultado = await casoUso.ejecutar({ ventaId: 'venta-1', tiendaId: 'tienda-1' });
    expect(resultado.id).toBe('fact-1');
  });

  it('debería rechazar si la venta no tiene factura', async () => {
    const casoUso = new ConsultarFacturaPorVentaUseCase(repositorioFacturas);
    await expect(casoUso.ejecutar({ ventaId: 'otra-venta', tiendaId: 'tienda-1' })).rejects.toThrow(
      'La venta no tiene una factura asociada',
    );
  });
});
