export interface Producto {
  id: string;
  tiendaId: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string | null;
  activo: boolean;
  fechaCreacion: Date;
}
