import { describe, it, expect, beforeEach } from 'vitest';
import { GenerarReporteUseCase } from '../GenerarReporteUseCase';
import { FakeVentaRepository } from '../../ventas/__tests__/FakeVentaRepository';
import { FakeProductoRepository } from '../../productos/__tests__/FakeProductoRepository';
import { inicioDelDia, finDelDia } from '../../../../domain/services/PeriodoReporte';

describe('GenerarReporteUseCase', () => {
  let casoUso: GenerarReporteUseCase;
  let repositorioVentas: FakeVentaRepository;
  let repositorioProductos: FakeProductoRepository;

  beforeEach(() => {
    repositorioVentas = new FakeVentaRepository();
    repositorioProductos = new FakeProductoRepository();
    casoUso = new GenerarReporteUseCase(repositorioVentas, repositorioProductos);
  });

  it('debería devolver un resumen en ceros cuando no hay ventas', async () => {
    const reporte = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      tipo: 'DIA',
      desde: inicioDelDia(new Date()),
      hasta: finDelDia(new Date()),
    });

    expect(reporte.resumen.cantidadVentas).toBe(0);
    expect(reporte.resumen.ingresos).toBe(0);
    expect(reporte.productosMasVendidos).toHaveLength(0);
    expect(reporte.ventasPorOrigen).toEqual({ MANUAL: 0, VOZ: 0 });
  });

  it('debería excluir ventas anuladas del resumen y del top de productos', async () => {
    const hoy = new Date();

    await repositorioVentas.guardar(
      {
        id: 'v1',
        tiendaId: 'tienda-1',
        usuarioId: 'u1',
        total: 100,
        origen: 'MANUAL' as never,
        anulada: false,
        fecha: hoy,
      },
      [],
    );
    await repositorioVentas.guardar(
      {
        id: 'v2',
        tiendaId: 'tienda-1',
        usuarioId: 'u1',
        total: 80,
        origen: 'VOZ' as never,
        anulada: true,
        fecha: hoy,
      },
      [],
    );

    repositorioVentas.agregarMasVendido({
      productoId: 'p1',
      nombre: 'Café',
      cantidadVendida: 3,
      totalGenerado: 105,
    });

    const reporte = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      tipo: 'DIA',
      desde: inicioDelDia(hoy),
      hasta: finDelDia(hoy),
    });

    expect(reporte.resumen.cantidadVentas).toBe(1);
    expect(reporte.resumen.ingresos).toBe(100);
    expect(reporte.ventasPorOrigen).toEqual({ MANUAL: 1, VOZ: 0 });
    expect(reporte.productosMasVendidos).toHaveLength(1);
  });

  it('debería resolver el nombre del producto cuando el repositorio no lo devuelve', async () => {
    const hoy = new Date();

    await repositorioProductos.guardar({
      id: 'p1',
      tiendaId: 'tienda-1',
      nombre: 'Café Americano',
      precio: 35,
      stock: 10,
      categoria: 'Bebidas',
      activo: true,
      fechaCreacion: new Date(),
    });

    repositorioVentas.agregarMasVendido({
      productoId: 'p1',
      nombre: '',
      cantidadVendida: 2,
      totalGenerado: 70,
    });

    const reporte = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      tipo: 'DIA',
      desde: inicioDelDia(hoy),
      hasta: finDelDia(hoy),
      limiteMasVendidos: 3,
    });

    expect(reporte.productosMasVendidos).toHaveLength(1);
    expect(reporte.productosMasVendidos[0].nombre).toBe('Café Americano');
  });

  it('debería respetar el límite de productos más vendidos', async () => {
    const hoy = new Date();

    for (let i = 0; i < 4; i++) {
      repositorioVentas.agregarMasVendido({
        productoId: `p${i}`,
        nombre: `Producto ${i}`,
        cantidadVendida: 4 - i,
        totalGenerado: 100 - i * 10,
      });
    }

    const reporte = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      tipo: 'DIA',
      desde: inicioDelDia(hoy),
      hasta: finDelDia(hoy),
      limiteMasVendidos: 2,
    });

    expect(reporte.productosMasVendidos).toHaveLength(2);
  });
});
