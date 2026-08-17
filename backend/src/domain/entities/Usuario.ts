import { RolUsuario } from '../enums/RolUsuario';

export interface Usuario {
  id: string;
  tiendaId: string;
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion: Date;
}
