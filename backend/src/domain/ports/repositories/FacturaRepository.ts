import { Factura } from '../../entities/Factura';

export interface FacturaRepository {
  guardar(factura: Factura): Promise<Factura>;
  buscarPorVentaId(ventaId: string, tiendaId: string): Promise<Factura | null>;
  buscarPorId(id: string, tiendaId: string): Promise<Factura | null>;
  listarPorRangoFechas(tiendaId: string, desde: Date, hasta: Date): Promise<Factura[]>;
  anular(id: string, tiendaId: string): Promise<void>;
}
