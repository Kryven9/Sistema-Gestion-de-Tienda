import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';

export interface ActivarOperadorComando {
  usuarioId: string;
  tiendaId: string;
}

export class ActivarOperadorUseCase {
  constructor(private readonly repositorioUsuarios: UsuarioRepository) {}

  async ejecutar(comando: ActivarOperadorComando): Promise<void> {
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

    await this.repositorioUsuarios.activar(comando.usuarioId, comando.tiendaId);
  }
}
