import { PrismaClient } from '@prisma/client';
import { Usuario } from '../../../domain/entities/Usuario';
import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { RolUsuario } from '../../../domain/enums/RolUsuario';

export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private prisma: PrismaClient) {}

  async guardar(usuario: Usuario): Promise<Usuario> {
    const guardado = await this.prisma.usuario.create({
      data: {
        id: usuario.id,
        tiendaId: usuario.tiendaId,
        nombre: usuario.nombre,
        correo: usuario.correo,
        passwordHash: usuario.passwordHash,
        rol: usuario.rol,
        activo: usuario.activo,
        fechaCreacion: usuario.fechaCreacion,
      },
    });

    return {
      id: guardado.id,
      tiendaId: guardado.tiendaId,
      nombre: guardado.nombre,
      correo: guardado.correo,
      passwordHash: guardado.passwordHash,
      rol: guardado.rol as RolUsuario,
      activo: guardado.activo,
      fechaCreacion: guardado.fechaCreacion,
    };
  }

  async buscarPorId(id: string, tiendaId: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, tiendaId },
    });
    if (!usuario) return null;

    return {
      id: usuario.id,
      tiendaId: usuario.tiendaId,
      nombre: usuario.nombre,
      correo: usuario.correo,
      passwordHash: usuario.passwordHash,
      rol: usuario.rol as RolUsuario,
      activo: usuario.activo,
      fechaCreacion: usuario.fechaCreacion,
    };
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { correo } });
    if (!usuario) return null;

    return {
      id: usuario.id,
      tiendaId: usuario.tiendaId,
      nombre: usuario.nombre,
      correo: usuario.correo,
      passwordHash: usuario.passwordHash,
      rol: usuario.rol as RolUsuario,
      activo: usuario.activo,
      fechaCreacion: usuario.fechaCreacion,
    };
  }

  async listarPorTienda(tiendaId: string): Promise<Usuario[]> {
    const usuarios = await this.prisma.usuario.findMany({
      where: { tiendaId },
      orderBy: { nombre: 'asc' },
    });

    return usuarios.map((u) => ({
      id: u.id,
      tiendaId: u.tiendaId,
      nombre: u.nombre,
      correo: u.correo,
      passwordHash: u.passwordHash,
      rol: u.rol as RolUsuario,
      activo: u.activo,
      fechaCreacion: u.fechaCreacion,
    }));
  }

  async actualizar(
    id: string,
    tiendaId: string,
    datos: Partial<Pick<Usuario, 'nombre'>>,
  ): Promise<Usuario> {
    const actualizado = await this.prisma.usuario.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: datos,
    });

    return {
      id: actualizado.id,
      tiendaId: actualizado.tiendaId,
      nombre: actualizado.nombre,
      correo: actualizado.correo,
      passwordHash: actualizado.passwordHash,
      rol: actualizado.rol as RolUsuario,
      activo: actualizado.activo,
      fechaCreacion: actualizado.fechaCreacion,
    };
  }

  async actualizarPassword(id: string, tiendaId: string, passwordHash: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: { passwordHash },
    });
  }

  async desactivar(id: string, tiendaId: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id_tiendaId: { id, tiendaId } },
      data: { activo: false },
    });
  }
}
