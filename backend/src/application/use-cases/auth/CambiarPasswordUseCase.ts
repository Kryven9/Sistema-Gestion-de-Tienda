import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { PasswordHasher } from '../../../domain/ports/services/PasswordHasher';
import { EntidadNoEncontradaError } from '../../../domain/errors/EntidadNoEncontradaError';
import { CredencialesInvalidasError } from '../../../domain/errors/CredencialesInvalidasError';

export interface CambiarPasswordComando {
  usuarioId: string;
  tiendaId: string;
  passwordActual: string;
  passwordNueva: string;
}

export class CambiarPasswordUseCase {
  constructor(
    private readonly repositorioUsuarios: UsuarioRepository,
    private readonly hashContrasena: PasswordHasher,
  ) {}

  async ejecutar(comando: CambiarPasswordComando): Promise<void> {
    const usuario = await this.repositorioUsuarios.buscarPorId(
      comando.usuarioId,
      comando.tiendaId,
    );

    if (!usuario) {
      throw new EntidadNoEncontradaError('Usuario', comando.usuarioId);
    }

    const passwordValida = await this.hashContrasena.compare(
      comando.passwordActual,
      usuario.passwordHash,
    );
    if (!passwordValida) {
      throw new CredencialesInvalidasError();
    }

    const nuevoHash = await this.hashContrasena.hash(comando.passwordNueva);
    await this.repositorioUsuarios.actualizarPassword(
      comando.usuarioId,
      comando.tiendaId,
      nuevoHash,
    );
  }
}
