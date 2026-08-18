import { Usuario } from '@domain/entities/Usuario';
import { UsuarioRepository } from '@domain/ports/repositories/UsuarioRepository';

export class FakeUsuarioRepository implements UsuarioRepository {
  private usuarios: Map<string, Usuario> = new Map();

  async guardar(usuario: Usuario): Promise<Usuario> {
    this.usuarios.set(usuario.id, { ...usuario });
    return usuario;
  }

  async buscarPorId(id: string, tiendaId: string): Promise<Usuario | null> {
    for (const u of this.usuarios.values()) {
      if (u.id === id && u.tiendaId === tiendaId) return { ...u };
    }
    return null;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    for (const u of this.usuarios.values()) {
      if (u.correo === correo) return { ...u };
    }
    return null;
  }

  async listarPorTienda(tiendaId: string): Promise<Usuario[]> {
    return [...this.usuarios.values()].filter((u) => u.tiendaId === tiendaId);
  }

  async actualizar(
    id: string,
    tiendaId: string,
    datos: Partial<Pick<Usuario, 'nombre'>>,
  ): Promise<Usuario> {
    for (const u of this.usuarios.values()) {
      if (u.id === id && u.tiendaId === tiendaId) {
        if (datos.nombre) u.nombre = datos.nombre;
        return { ...u };
      }
    }
    throw new Error('Usuario no encontrado');
  }

  async actualizarPassword(id: string, tiendaId: string, passwordHash: string): Promise<void> {
    for (const u of this.usuarios.values()) {
      if (u.id === id && u.tiendaId === tiendaId) {
        u.passwordHash = passwordHash;
        return;
      }
    }
    throw new Error('Usuario no encontrado');
  }

  async desactivar(id: string, tiendaId: string): Promise<void> {
    for (const u of this.usuarios.values()) {
      if (u.id === id && u.tiendaId === tiendaId) {
        u.activo = false;
        return;
      }
    }
    throw new Error('Usuario no encontrado');
  }
}
