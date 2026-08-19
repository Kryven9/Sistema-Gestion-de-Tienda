import api from './client';
import type { Producto } from './productos';

export type TipoReporte = 'DIA' | 'SEMANA' | 'MES' | 'RANGO';
export type OrigenVenta = 'MANUAL' | 'VOZ';

export interface ProductoVendido {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
  totalGenerado: number;
}

export interface ResumenVentas {
  totalVentas: number;
  cantidadVentas: number;
  ingresos: number;
}

export interface Reporte {
  tiendaId: string;
  tipo: TipoReporte;
  desde: string;
  hasta: string;
  resumen: ResumenVentas;
  productosMasVendidos: ProductoVendido[];
  ventasPorOrigen: Record<OrigenVenta, number>;
}

export interface ReporteFiltros {
  tipo: TipoReporte;
  desde?: string;
  hasta?: string;
  limiteMasVendidos?: number;
}

export async function generarReporte(filtros: ReporteFiltros): Promise<Reporte> {
  const params: Record<string, string | number> = { tipo: filtros.tipo };
  if (filtros.desde) params.desde = filtros.desde;
  if (filtros.hasta) params.hasta = filtros.hasta;
  if (filtros.limiteMasVendidos) params.limiteMasVendidos = filtros.limiteMasVendidos;
  const { data } = await api.get<Reporte>('/reportes', { params });
  return data;
}

export async function listarProductosStockBajo(umbral?: number): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/reportes/stock-bajo', { params: { umbral } });
  return data;
}
