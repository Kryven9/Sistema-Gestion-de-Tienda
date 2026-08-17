import { EstadoFactura } from '../enums/EstadoFactura';

export interface Factura {
  id: string;
  tiendaId: string;
  ventaId: string;
  folio: string;
  total: number;
  estado: EstadoFactura;
  leyenda: string;
  fechaEmision: Date;
}
