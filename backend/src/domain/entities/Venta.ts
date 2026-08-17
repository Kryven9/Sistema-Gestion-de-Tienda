import { OrigenVenta } from '../enums/OrigenVenta';

export interface Venta {
  id: string;
  tiendaId: string;
  usuarioId: string;
  total: number;
  origen: OrigenVenta;
  anulada: boolean;
  fecha: Date;
}
