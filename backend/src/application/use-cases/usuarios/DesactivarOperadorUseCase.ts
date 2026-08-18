import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface DesactivarOperadorComando {
  usuarioId: string;
  tiendaId: string;
}

export class DesactivarOperadorUseCase {
  constructor(private readonly repositorioUsuarios: UsuarioRepository) {}

  async ejecutar(comando: DesactivarOperadorComando): Promise<void> {
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

    await this.repositorioUsuarios.desactivar(comando.usuarioId, comando.tiendaId);
  }
}
