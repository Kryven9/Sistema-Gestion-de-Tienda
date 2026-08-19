import api from './client';

export type EstadoFactura = 'EMITIDA' | 'ANULADA';

export interface Factura {
  id: string;
  tiendaId: string;
  ventaId: string;
  folio: string;
  total: number;
  estado: EstadoFactura;
  leyenda: string;
  fechaEmision: string;
}

export interface RangoFechas {
  desde: string;
  hasta: string;
}

export async function listarFacturasPorRango(rango: RangoFechas): Promise<Factura[]> {
  const { data } = await api.get<Factura[]>('/facturas', { params: rango });
  return data;
}

export async function consultarDetalleFactura(id: string): Promise<Factura> {
  const { data } = await api.get<Factura>(`/facturas/${id}`);
  return data;
}

export async function consultarFacturaPorVenta(ventaId: string): Promise<Factura> {
  const { data } = await api.get<Factura>(`/facturas/venta/${ventaId}`);
  return data;
}
