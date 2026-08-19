import { describe, it, expect, beforeEach } from 'vitest';
import { ConsultarDetalleFacturaUseCase } from '../ConsultarDetalleFacturaUseCase';
import { FakeFacturaRepository } from '../../ventas/__tests__/FakeFacturaRepository';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';
import { EstadoFactura } from '../../../../domain/enums/EstadoFactura';

describe('ConsultarDetalleFacturaUseCase', () => {
  let repositorioFacturas: FakeFacturaRepository;

  beforeEach(async () => {
    repositorioFacturas = new FakeFacturaRepository();
    await repositorioFacturas.guardar({
      id: 'fact-1',
      tiendaId: 'tienda-1',
      ventaId: 'venta-1',
      folio: 'F-001',
      total: 120,
      estado: EstadoFactura.EMITIDA,
      leyenda: 'Documento simulado, sin validez fiscal',
      fechaEmision: new Date(),
    });
  });

  it('debería devolver la factura de la tienda del usuario', async () => {
    const casoUso = new ConsultarDetalleFacturaUseCase(repositorioFacturas);
    const resultado = await casoUso.ejecutar({
      facturaId: 'fact-1',
      tiendaId: 'tienda-1',
      usuarioId: 'user-1',
      esDueno: true,
    });
    expect(resultado.id).toBe('fact-1');
    expect(resultado.folio).toBe('F-001');
  });

  it('debería rechazar si la factura no existe', async () => {
    const casoUso = new ConsultarDetalleFacturaUseCase(repositorioFacturas);
    await expect(
      casoUso.ejecutar({
        facturaId: 'no-existe',
        tiendaId: 'tienda-1',
        usuarioId: 'user-1',
        esDueno: true,
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });

  it('debería rechazar si la factura pertenece a otra tienda', async () => {
    const casoUso = new ConsultarDetalleFacturaUseCase(repositorioFacturas);
    await expect(
      casoUso.ejecutar({
        facturaId: 'fact-1',
        tiendaId: 'otra-tienda',
        usuarioId: 'user-1',
        esDueno: true,
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });
});
