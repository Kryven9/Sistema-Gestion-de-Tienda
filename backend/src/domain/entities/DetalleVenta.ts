export interface DetalleVenta {
  id: string;
  tiendaId: string;
  ventaId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
