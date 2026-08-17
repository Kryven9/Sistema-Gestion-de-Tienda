import { Usuario } from '../../entities/Usuario';

export interface UsuarioRepository {
  guardar(usuario: Usuario): Promise<Usuario>;
  buscarPorId(id: string, tiendaId: string): Promise<Usuario | null>;
  buscarPorCorreo(correo: string): Promise<Usuario | null>;
  listarPorTienda(tiendaId: string): Promise<Usuario[]>;
  actualizar(
    id: string,
    tiendaId: string,
    datos: Partial<Pick<Usuario, 'nombre'>>,
  ): Promise<Usuario>;
  desactivar(id: string, tiendaId: string): Promise<void>;
}
