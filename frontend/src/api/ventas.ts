import api from './client';

export type OrigenVenta = 'MANUAL' | 'VOZ';

export interface DetalleVenta {
  id: string;
  tiendaId: string;
  ventaId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  tiendaId: string;
  usuarioId: string;
  total: number;
  origen: OrigenVenta;
  anulada: boolean;
  fecha: string;
  detalles?: DetalleVenta[];
}

export interface ItemVenta {
  productoId: string;
  cantidad: number;
}

export interface RegistrarVentaDto {
  items: ItemVenta[];
  origen?: OrigenVenta;
}

export interface RangoFechas {
  desde: string;
  hasta: string;
}

export async function registrarVenta(datos: RegistrarVentaDto): Promise<Venta> {
  const { data } = await api.post<Venta>('/ventas', datos);
  return data;
}

export async function listarVentasDelDia(): Promise<Venta[]> {
  const { data } = await api.get<Venta[]>('/ventas/mi-dia');
  return data;
}

export async function listarVentasPorRango(rango: RangoFechas): Promise<Venta[]> {
  const { data } = await api.get<Venta[]>('/ventas/rango', { params: rango });
  return data;
}

export async function consultarDetalleVenta(id: string): Promise<Venta> {
  const { data } = await api.get<Venta>(`/ventas/${id}`);
  return data;
}

export async function anularVenta(id: string): Promise<void> {
  await api.patch(`/ventas/${id}/anular`);
}
