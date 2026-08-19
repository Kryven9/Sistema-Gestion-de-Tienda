import { useQuery } from '@tanstack/react-query';
import {
  generarReporte,
  listarProductosStockBajo,
  type Reporte,
  type ReporteFiltros,
  type TipoReporte,
} from '../api/reportes';
import type { Producto } from '../api/productos';

export function useReporte(filtros: ReporteFiltros) {
  return useQuery({
    queryKey: ['reporte', filtros],
    queryFn: () => generarReporte(filtros),
  });
}

export function useProductosStockBajo(umbral: number = 5) {
  return useQuery<Producto[]>({
    queryKey: ['productos-stock-bajo', umbral],
    queryFn: () => listarProductosStockBajo(umbral),
  });
}

export type { Reporte, TipoReporte };
