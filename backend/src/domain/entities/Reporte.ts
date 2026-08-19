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

export type TipoReporte = 'DIA' | 'SEMANA' | 'MES' | 'RANGO';

export interface Reporte {
  tiendaId: string;
  tipo: TipoReporte;
  desde: Date;
  hasta: Date;
  resumen: ResumenVentas;
  productosMasVendidos: ProductoVendido[];
  ventasPorOrigen: Record<'MANUAL' | 'VOZ', number>;
}
