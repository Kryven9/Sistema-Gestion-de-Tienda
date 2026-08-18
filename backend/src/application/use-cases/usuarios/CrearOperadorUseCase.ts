import { Usuario } from '../../../domain/entities/Usuario';
import { RolUsuario } from '../../../domain/enums/RolUsuario';
import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { PasswordHasher } from '../../../domain/ports/services/PasswordHasher';
import { IdGenerator } from '../../../domain/ports/services/IdGenerator';
import { CorreoDuplicadoError } from '../../../domain/errors/CorreoDuplicadoError';

export interface CrearOperadorComando {
  tiendaId: string;
  nombre: string;
  correo: string;
  password: string;
}

export class CrearOperadorUseCase {
  constructor(
    private readonly repositorioUsuarios: UsuarioRepository,
    private readonly hashContrasena: PasswordHasher,
    private readonly generadorId: IdGenerator,
  ) {}

  async ejecutar(comando: CrearOperadorComando): Promise<Omit<Usuario, 'passwordHash'>> {
    const existente = await this.repositorioUsuarios.buscarPorCorreo(comando.correo);
    if (existente) {
      throw new CorreoDuplicadoError(comando.correo);
    }

    const passwordHash = await this.hashContrasena.hash(comando.password);

    const usuario: Usuario = {
      id: this.generadorId.generar(),
      tiendaId: comando.tiendaId,
      nombre: comando.nombre,
      correo: comando.correo,
      passwordHash,
      rol: RolUsuario.OPERADOR,
      activo: true,
      fechaCreacion: new Date(),
    };

    const guardado = await this.repositorioUsuarios.guardar(usuario);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _eliminado, ...sinPassword } = guardado;
    return sinPassword;
  }
}
