import { Usuario } from '../../../domain/entities/Usuario';
import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface EditarOperadorComando {
  usuarioId: string;
  tiendaId: string;
  nombre: string;
}

export class EditarOperadorUseCase {
  constructor(private readonly repositorioUsuarios: UsuarioRepository) {}

  async ejecutar(comando: EditarOperadorComando): Promise<Omit<Usuario, 'passwordHash'>> {
    const existente = await this.repositorioUsuarios.buscarPorId(
      comando.usuarioId,
      comando.tiendaId,
    );

    if (!existente) {
      throw new EntidadNoEncontradaError('Usuario', comando.usuarioId);
    }

    if (existente.rol !== 'OPERADOR') {
      throw new EntidadNoEncontradaError('Usuario operador', comando.usuarioId);
    }

    const actualizado = await this.repositorioUsuarios.actualizar(
      comando.usuarioId,
      comando.tiendaId,
      { nombre: comando.nombre },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _eliminado, ...sinPassword } = actualizado;
    return sinPassword;
  }
}
